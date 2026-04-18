"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

type RowData = Record<string, string | number>;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any[]>([]);
  const [messages, setMessages] = useState<
    { type: "user" | "system"; text: string }[]
  >([]);
  const [query, setQuery] = useState("");
  const [showChat, setShowChat] = useState(true);

  // Upload
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("https://ai-sales-dashboard-backendend.onrender.com/upload", {
      method: "POST",
      body: formData
    });
  };

  // Charts
  const fetchCharts = async () => {
    const res = await fetch("https://ai-sales-dashboard-backendend.onrender.com/analyze");
    const data = await res.json();
    setChartData(data.chartData);
  };

  // AI Query
  const handleAIQuery = async () => {
    if (!query) return;

    setMessages(prev => [...prev, { type: "user", text: query }]);

    const res = await fetch("https://ai-sales-dashboard-backendend.onrender.com/ai-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const result = await res.json();

    if (result.aiResponse) {
      const processRes = await fetch("https://ai-sales-dashboard-backendend.onrender.com/process-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(result.aiResponse)
      });

      const finalData = await processRes.json();
      setAnalysisResult(finalData.result);

      setMessages(prev => [
        ...prev,
        { type: "system", text: "Analysis completed ✅" }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        { type: "system", text: "AI failed ❌" }
      ]);
    }

    setQuery("");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">SalesAI</h1>
          <p className="text-gray-400 text-sm">
            Intelligent Sales Dashboard
          </p>
        </div>

        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-[#0f172a] px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800"
        >
          💬 AI Assistant
        </button>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* Upload */}
        <div className="bg-[#020617] border border-gray-800 p-6 rounded-xl">
          <p className="font-semibold mb-2">Upload</p>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm w-full h-10 text-gray-500 "
          />
          <button
            onClick={handleUpload}
            className="mt-3 bg-cyan-500 text-black px-3 py-1 rounded "
          >
            Upload
          </button>
        </div>

        {/* Charts */}
        <div
          onClick={fetchCharts}
          className="bg-[#022c22] border border-cyan-500 p-6 rounded-xl cursor-pointer"
        >
          <p className="font-semibold text-cyan-400">Show Charts</p>
          <p className="text-gray-400 text-sm">Revenue analytics</p>
        </div>

        {/* Top Products */}
        <div
          onClick={async () => {
            const res = await fetch("https://ai-sales-dashboard-backendend.onrender.com/process-query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operation: "top",
                metric: "sales",
                limit: 5
              })
            });
            const data = await res.json();
            setAnalysisResult(data.result);
          }}
          className="bg-[#020617] border border-gray-800 p-6 rounded-xl cursor-pointer"
        >
          <p className="font-semibold">Top Product</p>
          <p className="text-gray-400 text-sm">Best performers</p>
        </div>

        {/* Sales by Region */}
        <div
          onClick={async () => {
            const res = await fetch("https://ai-sales-dashboard-backendend.onrender.com/process-query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                operation: "group_sum",
                column: "region",
                metric: "sales"
              })
            });
            const data = await res.json();
            setAnalysisResult(data.result);
          }}
          className="bg-[#020617] border border-gray-800 p-6 rounded-xl cursor-pointer"
        >
          <p className="font-semibold">Sales by Region</p>
          <p className="text-gray-400 text-sm">Geographic breakdown</p>
        </div>

        {/* Insights */}
        <div
          onClick={async () => {
            const res = await fetch("https://ai-sales-dashboard-backendend.onrender.com/insights");
            const data = await res.json();
            setAnalysisResult(data.insights);
          }}
          className="bg-[#020617] border border-gray-800 p-6 rounded-xl cursor-pointer"
        >
          <p className="font-semibold">Generate Insight</p>
          <p className="text-gray-400 text-sm">AI-powered analysis</p>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-[#020617] border border-gray-800 p-6 rounded-xl mb-8">
  <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>

  {chartData.length > 0 ? (
    <div className="flex flex-col gap-6">

      {/* LINE CHART */}
      <LineChart width={700} height={250} data={chartData}>
        <CartesianGrid stroke="#1f2937" />
        <XAxis dataKey="name" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#22d3ee"
          strokeWidth={3}
        />
      </LineChart>

      {/* BAR CHART */}
      <BarChart width={700} height={250} data={chartData}>
        <CartesianGrid stroke="#1f2937" />
        <XAxis dataKey="name" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip />
        <Bar dataKey="sales" fill="#22d3ee" />
      </BarChart>

    </div>
  ) : (
    <p className="text-gray-400">Click "Show Charts"</p>
  )}
</div>

      {/* RESULT */}
      <div className="bg-[#020617] border border-gray-800 p-6 rounded-xl">
        <h2 className="mb-2 font-semibold">Analysis Result</h2>
        <pre className="text-sm text-gray-300">
          {JSON.stringify(analysisResult, null, 2)}
        </pre>
      </div>

      {/* AI SIDEBAR */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-80 bg-[#020617] border-l border-gray-800 p-4">
          <div className="flex justify-between mb-4">
            <h2>AI Assistant</h2>
            <button onClick={() => setShowChat(false)}>X</button>
          </div>

          <div className="space-y-2 max-h-[60%] overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  msg.type === "user"
                    ? "bg-cyan-500 text-black text-right"
                    : "bg-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-gray-900 px-2 py-2 flex-1 rounded"
            />
            <button
              onClick={handleAIQuery}
              className="bg-cyan-500 px-3 rounded text-black"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}