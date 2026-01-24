import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Comment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Reply, Shield, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LessonDiscussionProps {
    lessonId: number;
}

type CommentWithUser = Comment & {
    user: User;
    replies?: CommentWithUser[];
};

// Extracted Component to prevent re-mounting on parent re-render
const CommentItem = ({
    comment,
    isReply = false,
    currentUser,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    onCreateReply,
    onDelete,
    isPendingReply,
    isPendingDelete
}: {
    comment: CommentWithUser;
    isReply?: boolean;
    currentUser: User | null;
    replyingTo: number | null;
    setReplyingTo: (id: number | null) => void;
    replyContent: string;
    setReplyContent: (v: string) => void;
    onCreateReply: (content: string, parentId: number) => void;
    onDelete: (id: number) => void;
    isPendingReply: boolean;
    isPendingDelete: boolean;
}) => {
    // Helper to determine if user can delete
    const canDelete = () => {
        if (!currentUser) return false;
        if (comment.userId === currentUser.id) return true;
        // Check if user has admin/staff privileges
        return ["instructor", "ta", "org_admin", "super_admin"].includes(currentUser.role);
    };

    const isStaff = (role: string) => ["instructor", "ta"].includes(role);

    return (
        <div className={`flex gap-3 ${isReply ? "ml-12 mt-2" : "mt-4"} group`}>
            <Avatar className="h-8 w-8">
                <AvatarFallback className={isStaff(comment.user.role) ? "bg-primary text-primary-foreground" : ""}>
                    {comment.user.username[0].toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.user.username}</span>
                    {isStaff(comment.user.role) && (
                        <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium border border-primary/20">
                            {comment.user.role === 'ta' ? <Award className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            {comment.user.role === 'ta' ? "Teaching Assistant" : "Instructor"}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>

                <div className="flex items-center gap-4 pt-1">
                    {!isReply && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs"
                            onClick={() => {
                                if (replyingTo === comment.id) {
                                    setReplyingTo(null);
                                    setReplyContent("");
                                } else {
                                    setReplyingTo(comment.id);
                                    setReplyContent("");
                                }
                            }}
                        >
                            <Reply className="w-3 h-3 mr-1" /> Reply
                        </Button>
                    )}
                    {canDelete() && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-muted-foreground hover:text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onDelete(comment.id)}
                            disabled={isPendingDelete}
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                    )}
                </div>

                {/* Reply Input */}
                {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                        <Textarea
                            // Request: "solve issues". Focus issue: moving component out solved it.
                            autoFocus
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="min-h-[60px] text-sm"
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                onClick={() => onCreateReply(replyContent, comment.id)}
                                disabled={isPendingReply || !replyContent.trim()}
                            >
                                Reply
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function LessonDiscussion({ lessonId }: LessonDiscussionProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const { data: comments, isLoading } = useQuery<CommentWithUser[]>({
        queryKey: [`/api/lessons/${lessonId}/comments`],
    });

    const createComment = useMutation({
        mutationFn: async ({ content, parentId }: { content: string, parentId?: number }) => {
            const res = await fetch(`/api/lessons/${lessonId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, parentId }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || res.statusText);
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/lessons/${lessonId}/comments`] });
            setNewComment("");
            setReplyingTo(null);
            setReplyContent("");
            toast({ title: "Comment posted" });
        },
        onError: (err) => toast({
            title: "Failed to post comment",
            description: err.message,
            variant: "destructive"
        })
    });

    const deleteComment = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/lessons/${lessonId}/comments`] });
            toast({ title: "Comment deleted" });
        }
    });

    const topLevelComments = comments || [];

    if (isLoading) return <div className="py-8 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading discussion...</div>;

    return (
        <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-semibold mb-6">Discussion ({comments?.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) || 0})</h3>

            {/* New Comment Input */}
            <div className="flex gap-4 mb-8">
                <Avatar>
                    <AvatarFallback>{user?.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Ask a question or share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={() => createComment.mutate({ content: newComment })}
                            disabled={createComment.isPending || !newComment.trim()}
                        >
                            {createComment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comment List */}
            <div className="space-y-6">
                {topLevelComments.map(comment => (
                    <div key={comment.id}>
                        <CommentItem
                            comment={comment}
                            currentUser={user || null}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            onCreateReply={(content, parentId) => createComment.mutate({ content, parentId })}
                            onDelete={(id) => deleteComment.mutate(id)}
                            isPendingReply={createComment.isPending}
                            isPendingDelete={deleteComment.isPending}
                        />
                        {comment.replies?.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                isReply
                                currentUser={user || null}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyContent={replyContent}
                                setReplyContent={setReplyContent}
                                onCreateReply={(content, parentId) => createComment.mutate({ content, parentId })}
                                onDelete={(id) => deleteComment.mutate(id)}
                                isPendingReply={createComment.isPending}
                                isPendingDelete={deleteComment.isPending}
                            />
                        ))}
                    </div>
                ))}
                {topLevelComments.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-lg">
                        <p>No comments yet. Be the first to start the discussion!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
