import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const VideoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, //cluodniary se String aati hai;
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary se String aati hai;
      required: true,
    },
    title: {
      type: String, //cloudinary se String aati hai;
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number, //cloudinary se Duration aati hai,
      required: true,
    },
    view: {
      type: Number,
      default: 0,
    },
    isPublished: { 
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', VideoSchema);
