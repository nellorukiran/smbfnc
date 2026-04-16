import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import axios from "axios";

// Interface for chat messages
interface Message {
    role: "user" | "assistant";
    content: string;
}

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your AI Business Assistant. Ask me about collections, overdue customers, or active loans." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Use relative path for production
            const response = await axios.post("/api/ai/chat", {
                message: input
            });

            const botMessage: Message = {
                role: "assistant",
                content: response.data.reply || "I couldn't get a response."
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again later."
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Action Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                    <MessageCircle className="h-8 w-8 text-white" />
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6" />
                            <CardTitle className="text-lg">Business Assistant</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden bg-background">
                        <div
                            ref={scrollRef}
                            className="h-full overflow-y-auto p-4 space-y-4"
                        >
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex w-full items-start gap-2",
                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div
                                        className={cn(
                                            "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex w-full items-center gap-2">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="text-muted-foreground text-sm flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="p-3 bg-muted/20 border-t">
                        <div className="flex w-full items-center gap-2">
                            <Input
                                placeholder="Ask about daily stats..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isLoading}
                                className="flex-1 bg-background"
                            />
                            <Button
                                onClick={handleSend}
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};

export default AIAssistant;
