import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import uploadImage from '../../middleware/upload';
import { PostServices } from './post.services';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  if (req.file) data.image = await uploadImage(req);
  
  const result = await PostServices.createPostInDB({ ...data, user: req.user.userId });
  sendResponse(res, { statusCode: 201, success: true, message: 'Post shared!', data: result });
});

const getFeed = catchAsync(async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const result = await PostServices.getChannelPostsFromDB(channelId as string, req.user.userId, req.query);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feed loaded', data: result});
});

const handleLike = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.togglePostLikeInDB(req.user.userId, req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Like updated', data: result });
});

const addComment = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.addCommentInDB(req.user.userId, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Comment added', data: result });
});

export const PostControllers = { createPost, getFeed, handleLike, addComment };