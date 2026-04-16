import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, BarChart3, PieChart as PieChartIcon, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import axios from "axios";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";

// Interface for chat messages
interface ChartData {
    type: "CHART";
    chartType: "bar" | "line" | "pie";
    title: string;
    data: any[];
    message: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    chart?: ChartData;
}

const COLORS = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6'];

const AIAssistantPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your AI Business Assistant. I can analyze your daily collections, overdue customers, active loans, and visualize trends! How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // In a real app, use environment variable for API URL
            const response = await axios.post("/api/ai/chat", {
                message: input
            });

            const rawReply = response.data.reply || "I couldn't get a response.";

            // Parse for JSON chart data
            let botMessage: Message = { role: "assistant", content: rawReply };
            const jsonStart = rawReply.indexOf("###JSON_START###");
            const jsonEnd = rawReply.indexOf("###JSON_END###");

            if (jsonStart !== -1 && jsonEnd !== -1) {
                try {
                    const jsonString = rawReply.substring(jsonStart + 16, jsonEnd).trim();
                    const chartData = JSON.parse(jsonString);
                    botMessage = {
                        role: "assistant",
                        content: chartData.message || "Here is the data you requested.",
                        chart: chartData
                    };
                } catch (e) {
                    console.error("Failed to parse chart JSON", e);
                    botMessage = { role: "assistant", content: rawReply }; // Fallback
                }
            }

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

    const handleClearChat = () => {
        setMessages([
            { role: "assistant", content: "Hello! I'm your AI Business Assistant. I can analyze your daily collections, overdue customers, active loans, and visualize trends! How can I help you today?" }
        ]);
    };

    const suggestions = [
        "Show weekly collection trend",
        "Expense breakdown chart",
        "Top selling products",
        "How many overdue customers?"
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const renderMessageContent = (content: string) => {
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const renderChart = (chart: ChartData) => {
        return (
            <div className="mt-4 w-full h-[250px] md:h-[300px] bg-background/50 rounded-lg p-2 border border-border/50">
                <p className="text-xs font-semibold text-center mb-2 text-muted-foreground">{chart.title}</p>
                <ResponsiveContainer width="100%" height="90%">
                    {chart.chartType === 'bar' ? (
                        <BarChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                                formatter={(value: number) => [formatCurrency(value), "Value"]}
                            />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : chart.chartType === 'line' ? (
                        <LineChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [formatCurrency(value), "Value"]}
                            />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={chart.data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chart.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [formatCurrency(value), "Value"]} />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4 h-[calc(100vh-6rem)]">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Sparkles className="h-8 w-8 text-primary" />
                            AI Assistant
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearChat}
                        className="text-muted-foreground hover:text-destructive gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear Chat
                    </Button>
                </div>

                <Card className="flex-1 flex flex-col shadow-md border-primary/20 overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>AI has access to: Weekly Trends, Expenses, Collections, Loans</span>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden bg-background relative color-red-200">
                        <div
                            ref={scrollRef}
                            className="h-full overflow-y-auto p-4 md:p-6 space-y-6"
                        >
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex w-full items-start gap-3",
                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full border shadow-sm",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-white text-primary border-primary/20"
                                        )}
                                    >
                                        {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
                                    </div>
                                    <div
                                        className={cn(
                                            "rounded-2xl px-5 py-3 text-sm md:text-base shadow-sm max-w-[85%] md:max-w-[75%]",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-muted/50 text-foreground border border-border/50 rounded-tl-none"
                                        )}
                                    >
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {renderMessageContent(msg.content)}
                                        </div>
                                        {msg.chart && renderChart(msg.chart)}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex w-full items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted/30 px-4 py-3 rounded-2xl rounded-tl-none border border-border/50">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-muted-foreground text-sm">Analyzing data...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 bg-background border-t space-y-4 flex-col">
                        {/* Suggestions (Horizontal Scroll on mobile) */}
                        {messages.length < 5 && (
                            <div className="w-full flex gap-2 overflow-x-auto pb-2 noscrollbar">
                                {suggestions.map((suggestion, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setInput(suggestion);
                                            // Optional: Auto-send or just populate
                                        }}
                                        className="whitespace-nowrap rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        )}

                        <div className="flex w-full items-center gap-2">
                            <Input
                                placeholder="Ask about trends, charts, or stats..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isLoading}
                                className="flex-1 bg-muted/50 border-input/50 h-12 text-base focus-visible:ring-primary/20"
                            />
                            <Button
                                onClick={handleSend}
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="shrink-0 h-12 w-12 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AIAssistantPage;
