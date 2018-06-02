import mongoose from '../config'
import db from '..';

const managerSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    recommendations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recommendation'
    }]
})

const userSchema = new mongoose.Schema({
    //wechat openid
    openid: {
        type: String,
        required: true,
        unique: true
    },
    nickName: String,
    avatarUrl: String,
    //open or close blind assistance mode
    blindMode: {
        type: Boolean,
        default: false
    },
    //total like-mark given from others
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    //user's all shared ideas
    ideas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'idea'
    }],
    //user's all sent comments
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    }],
    //all recommendations user have received
    recommendations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recommendation'
    }]

})

const ideaSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    recommendation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recommendation'
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    }],
    date: {
        type: Date,
        required: true
    },
    content: String,
    soundFragments: Array,
    random:{
        type: Number,
        default: Math.random(),
        index:true
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    dislike: {
        type: Number,
        default: 0,
        min: 0
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
})

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    idea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'idea'
    },
    soundFragments: Array,
    date: Date
})

const recommendationSchema = new mongoose.Schema({
    type: String,
    detail: Object,
    soundFragments: Array,
    date: String,
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    ideas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'idea'
    }],
    star: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'star'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'manager'
    },
    uploadDate: Date
})

const starSchema = new mongoose.Schema({
    describtion: String,
    recommendations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recommendation'
    }]
})

ideaSchema.index({author:-1,date:-1})
ideaSchema.index({date:-1,random:-1})
ideaSchema.index({_id:-1,likes:-1})
ideaSchema.index({likes:-1,date:-1})

const manager = mongoose.model('manager', managerSchema)
const user = mongoose.model('user', userSchema)
const idea = mongoose.model('idea', ideaSchema)
const comment = mongoose.model('comment', commentSchema)
const recommendation = mongoose.model('recommendation', recommendationSchema)
const star = mongoose.model('star', starSchema)

export default {
    ObjectId: mongoose.Types.ObjectId,
    manager,
    user,
    idea,
    comment,
    recommendation,
    star
}