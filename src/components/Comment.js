import React, { useState, useEffect } from "react";
import axios from "axios";
import ReplyBox from "./ReplyBox.jsx";
import settings from "../settings.json";
import "./Comment.css";

const UP_CODE = "\u25B2";
const DOWN_CODE = "\u25BC";

const countChildren = (comment) => {
    const sub = comment.comments;
    if (!sub || sub.length === 0) {
        return 0;
    }

    let count = 0;
    for (const c of sub) {
        count += countChildren(c) + 1;
    }

    return count;
};

const Comment = ({ questionId, comment, reply, refresh }) => {
    const [hidden, setHidden] = useState(false);

    const childrenCount = countChildren(comment) + 1;

    async function handleVote(direction) {
        const api = settings.backendEndpoint + "questions/" + questionId + "/comments/" + comment.id + "/vote";
        try {
            const res = await axios.post(api, { direction });
            const data = res.data;
            if (data.ok) {
                refresh();
                // TODO: refresh or update state
            }
        } catch (e) {
            console.error("Failed to vote comment", e);
        }
    }

    comment.points = comment.upVotes - comment.downVotes;

    return (
        <div className="Comment">
            <div className="Comment-header">
                <button className="Comment-vote-btn" onClick={() => handleVote("UP")}>
                    {UP_CODE}
                </button>{" "}
                <span className="Comment-points">{comment.points}</span>{" "}
                <button className="Comment-vote-btn" onClick={() => handleVote("DOWN")}>
                    {DOWN_CODE}
                </button>
                <span className="Comment-user"> {comment.userId} </span>{" "}
                <span className="Comment-time"> {comment.dateAdded} </span>{" "}
                <span className="Comment-hide" onClick={() => setHidden(!hidden)}>
                    [{hidden ? "+" + childrenCount : "-"}]
                </span>{" "}
            </div>
            {!hidden && (
                <>
                    <div>
                        <pre className="Comment-content">{comment.text}</pre>
                        <div className="Comment-footer">
                            {reply.replyParent === comment.id ? (
                                <ReplyBox
                                    questionId={questionId}
                                    commentId={comment.id}
                                    onReply={() => { reply.setReplyParent(null); refresh() }}
                                />
                            ) : (
                                <button className="btn btn-link Comment-btn-reply-child" onClick={() => reply.setReplyParent(comment.id)}>
                                    reply
                                </button>
                            )}
                        </div>
                    </div>
                    {comment.comments && <CommentList comments={comment.comments} reply={reply} refresh={refresh}></CommentList>}
                </>
            )}
        </div>
    );
};

const CommentList = ({ questionId, comments, reply, refresh }) => {
    return (
        <div className="CommentList">
            {comments.map((c) => (
                <Comment key={c.id} questionId={questionId} comment={c} reply={reply} refresh={refresh} />
            ))}
        </div>
    );
};

const CommentBox = ({ questionId }) => {
    const [comments, setComments] = useState(null);
    const [replyParent, setReplyParent] = useState(null);
    const [dirty, setDirty] = useState(0); // changing vlaue of 'dirty' refreshes commentbox

    const refresh = () => setDirty(Math.random());

    useEffect(() => {
        async function fetchComments() {
            const api = settings.backendEndpoint + "questions/" + questionId + "/comments";
            const res = await axios.get(api);
            const data = res.data;

            if (data.ok) {
                setComments(data.comments);
            }
        }

        fetchComments();
    }, [questionId, dirty]);

    return (
        <>
            <ReplyBox questionId={questionId} isParentQuestion={true} onReply={() => refresh()} />
            {comments &&
                (comments.length === 0 ? (
                    <p>No comments</p>
                ) : (
                    <CommentList
                        questionId={questionId}
                        comments={comments}
                        reply={{ replyParent, setReplyParent }}
                        refresh={refresh}
                    ></CommentList>
                ))}
        </>
    );
};

export { Comment, CommentList, CommentBox };
