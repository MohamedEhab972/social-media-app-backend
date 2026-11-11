import mongoose from "mongoose";
import { AvailabilityEnum, type IPost } from "../../common/indexs.js";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: { type: String, trim: true, maxlength: 5000 },
    attachments: { type: [String], default: [] },
    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.Public,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

// ---------------- Mongoose middlewares ----------------

// A post must have text or at least one attachment
postSchema.pre("validate", function () {
  if (!this.content?.trim() && this.attachments.length === 0) {
    throw new Error("Post must have content or at least one attachment");
  }
});

// Always populate the author on every find query
postSchema.pre(/^find/, function (this: mongoose.Query<unknown, IPost>) {
  this.populate({ path: "createdBy", select: "firstName lastName profileImage" });
});

// Cascade: deleting a post deletes all of its comments
postSchema.post("findOneAndDelete", async function (doc: IPost & { _id: unknown } | null) {
  if (doc) {
    await mongoose.model("Comment").deleteMany({ postId: doc._id });
  }
});

const PostModel = mongoose.model<IPost>("Post", postSchema);

export default PostModel;
