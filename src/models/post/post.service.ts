import { Types } from "mongoose";
import PostModel from "../../database/model/post.model.js";
import UserModel from "../../database/model/user.model.js";
import { AvailabilityEnum } from "../../common/indexs.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions/error.exceptions.js";
import { s3Service } from "../../common/service/s3.service.js";
import { MulterStorageEnum } from "../../common/enums/multer.enum.js";

class PostService {
  /** Posts the user is allowed to see: own + public + friends-only posts of friends */
  private async visibilityFilter(userId: string) {
    const user = await UserModel.findById(userId).select("friends");
    const friends = user?.friends ?? [];
    return {
      $or: [
        { createdBy: new Types.ObjectId(userId) },
        { availability: AvailabilityEnum.Public },
        { availability: AvailabilityEnum.Friends, createdBy: { $in: friends } },
      ],
    };
  }

  async createPost(
    userId: string,
    data: { content?: string; availability: AvailabilityEnum },
    files: Express.Multer.File[] = [],
  ) {
    if (!data.content && files.length === 0) {
      throw new BadRequestException(
        "Post must have content or at least one attachment",
      );
    }
    const attachments = await Promise.all(
      files.map((file) =>
        s3Service.uploadFile({
          storageKey: MulterStorageEnum.memoryStorage,
          path: `posts/${userId}`,
          fileContent: file,
          contentType: file.mimetype,
        }),
      ),
    );
    return await PostModel.create({
      ...data,
      attachments,
      createdBy: new Types.ObjectId(userId),
    });
  }

  async getFeed(userId: string) {
    return await PostModel.find(await this.visibilityFilter(userId)).sort({
      createdAt: -1,
    });
  }

  async getPost(userId: string, postId: string) {
    const post = await PostModel.findOne({
      _id: postId,
      ...(await this.visibilityFilter(userId)),
    });
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    return post;
  }

  async getUserPosts(userId: string, ownerId: string) {
    return await PostModel.find({
      createdBy: ownerId,
      ...(await this.visibilityFilter(userId)),
    }).sort({ createdAt: -1 });
  }

  async updatePost(
    userId: string,
    postId: string,
    data: { content?: string; availability?: AvailabilityEnum },
  ) {
    const post = await PostModel.findOneAndUpdate(
      { _id: postId, createdBy: userId },
      { $set: data },
      { returnDocument: "after", runValidators: true },
    );
    if (!post) {
      throw new NotFoundException("Post not found or you are not the owner");
    }
    return post;
  }

  async deletePost(userId: string, postId: string) {
    // post("findOneAndDelete") middleware removes the post's comments
    const post = await PostModel.findOneAndDelete({
      _id: postId,
      createdBy: userId,
    });
    if (!post) {
      throw new NotFoundException("Post not found or you are not the owner");
    }
    return post;
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.getPost(userId, postId);
    const liked = post.likes.some((id) => id.equals(userId));
    const updated = await PostModel.findByIdAndUpdate(
      post._id,
      liked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { returnDocument: "after" },
    );
    return { liked: !liked, likesCount: updated?.likes.length ?? 0 };
  }
}

export default new PostService();
