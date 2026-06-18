import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Post, Comment } from './post.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment';
import { TComment, TPost } from './post.interface';
import { Channel } from '../Channel/channel.model';

const createPostInDB = async (payload: TPost) => {
      const isMember = await Channel.exists({ _id: payload.channel, members: payload.user });
  
  if (!isMember) {
    throw new AppError(httpStatus.FORBIDDEN, "You cannot post in a channel you haven't joined.");
  }
  const result = await Post.create(payload);
  return result;
};

const getChannelPostsFromDB = async (channelId: string, userId: string, query: Record<string, unknown>) => {
  
  
  const channel = await Channel.findOne({ _id: channelId, members: userId, isDeleted: false });
  
  if (!channel) {
    throw new AppError(httpStatus.FORBIDDEN, "Access Denied! You are not a member of this channel.");
  }

  const postQuery = new QueryBuilder(
    Post.find({ channel: channelId, isDeleted: false }).populate('user', 'firstName lastName image memberNumber'),
    query
  )
    .sort()
    .paginate();

  const posts = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();

  const modifiedResult = await Promise.all(
    posts.map(async (post) => {
      const comments = await Comment.find({ post: post._id, isDeleted: false })
        .populate('user', 'firstName lastName image')
        .sort('-createdAt')
        .limit(2);

      return {
        ...post.toObject(),
        timeAgo: moment(post.createdAt).fromNow(),
        isLiked: post.likes.some((id) => id.toString() === userId),
        recentComments: comments,
      };
    })
  );

  return { meta, result: modifiedResult };
};

const togglePostLikeInDB = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, 'Post not found');

  const isLiked = post.likes.includes(userId as any);
  if (isLiked) {
    return await Post.findByIdAndUpdate(postId, { $pull: { likes: userId }, $inc: { likeCount: -1 } }, { new: true });
  } else {
    return await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId }, $inc: { likeCount: 1 } }, { new: true });
  }
};

const addCommentInDB = async (userId: string, payload: TComment) => {
  const result = await Comment.create({ ...payload, user: userId });
  return await result.populate('user', 'firstName lastName image');
};

export const PostServices = { createPostInDB, getChannelPostsFromDB, togglePostLikeInDB, addCommentInDB };