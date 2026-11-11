import type { Types } from "mongoose";
import type { AvailabilityEnum, FriendRequestStatusEnum } from "../indexs.js";

export interface IPost {
  content?: string;
  attachments: string[];
  availability: AvailabilityEnum;
  createdBy: Types.ObjectId;
  likes: Types.ObjectId[];
  commentsCount: number;
}

export interface IComment {
  content: string;
  postId: Types.ObjectId;
  createdBy: Types.ObjectId;
}

export interface IFriendRequest {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: FriendRequestStatusEnum;
}
