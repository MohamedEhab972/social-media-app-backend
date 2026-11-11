import mongoose from "mongoose";
import type { IComment } from "../../common/indexs.js";

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// ---------------- Mongoose middlewares ----------------

// Remember whether the document is new so post("save") knows it was a create
commentSchema.pre("save", function () {
  this.$locals.wasNew = this.isNew;
});

// Keep post.commentsCount in sync on create
commentSchema.post("save", async function (doc) {
  if (doc.$locals.wasNew) {
    await mongoose
      .model("Post")
      .updateOne({ _id: doc.postId }, { $inc: { commentsCount: 1 } });
  }
});

// ...and on delete
commentSchema.post("findOneAndDelete", async function (doc: IComment | null) {
  if (doc) {
    await mongoose
      .model("Post")
      .updateOne(
        { _id: doc.postId, commentsCount: { $gt: 0 } },
        { $inc: { commentsCount: -1 } },
      );
  }
});

// Populate the comment author on every find
commentSchema.pre(/^find/, function (this: mongoose.Query<unknown, IComment>) {
  this.populate({ path: "createdBy", select: "firstName lastName profileImage" });
});

const CommentModel = mongoose.model<IComment>("Comment", commentSchema);

export default CommentModel;
