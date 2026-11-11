import { Types } from "mongoose";
import CommentModel from "../../database/model/comment.model.js";
import {
  ForbiddenException,
  NotFoundException,
} from "../../common/exceptions/error.exceptions.js";
import postService from "../post/post.service.js";

type Populated = { _id: Types.ObjectId };

class CommentService {
  async createComment(userId: string, postId: string, content: string) {
    // throws if the post doesn't exist or the user can't see it
    await postService.getPost(userId, postId);
    // post("save") middleware increments post.commentsCount
    return await CommentModel.create({
      content,
      postId: new Types.ObjectId(postId),
      createdBy: new Types.ObjectId(userId),
    });
  }

  async getComments(userId: string, postId: string) {
    await postService.getPost(userId, postId);
    return await CommentModel.find({ postId }).sort({ createdAt: -1 });
  }

  async updateComment(
    userId: string,
    postId: string,
    commentId: string,
    content: string,
  ) {
    await postService.getPost(userId, postId);
    const comment = await CommentModel.findOneAndUpdate(
      { _id: commentId, postId, createdBy: userId },
      { $set: { content } },
      { returnDocument: "after", runValidators: true },
    );
    if (!comment) {
      throw new NotFoundException("Comment not found or you are not the owner");
    }
    return comment;
  }

  /** The comment owner or the post owner can delete a comment */
  async deleteComment(userId: string, postId: string, commentId: string) {
    const post = await postService.getPost(userId, postId);
    const comment = await CommentModel.findOne({ _id: commentId, postId });
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    // createdBy is populated by the pre(/^find/) middleware
    const commentOwner = comment.createdBy as unknown as Populated;
    const postOwner = post.createdBy as unknown as Populated;
    if (!commentOwner._id.equals(userId) && !postOwner._id.equals(userId)) {
      throw new ForbiddenException("You are not allowed to delete this comment");
    }
    // post("findOneAndDelete") middleware decrements post.commentsCount
    return await CommentModel.findOneAndDelete({ _id: commentId });
  }
}

export default new CommentService();
