"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const chatParent = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  });


  
  return (
    <main className="flex w-full min-h-screen bg-background">
      <section className="flex flex-col w-full relative">
        <header className="p-4 border-b w-full">
          <h1 className="text-2xl font-bold">AI Codex Assistant</h1>
        </header>

        <section className="flex-grow p-4 mb-[70px]">
          <ul
            ref={chatParent}
            className="h-full p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4"
          >
            {messages.map((m, index) => (
              <div key={index}>
                {m.role === "user" ? (
                  <li className="flex flex-row">
                    <div className="rounded-xl p-4 bg-background shadow-md flex">
                      <p className="text-primary">{m.content}</p>
                    </div>
                  </li>
                ) : (
                  <li className="flex flex-row-reverse">
                    <div className="rounded-xl p-4 bg-slate-200 shadow-md flex min-w-3/4">
                      <div className="text-primary">
                        <span className="font-bold">Answer: </span>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{ a: LinkRenderer }}
                          className="whitespace-pre-wrap"
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </li>
                )}
              </div>
            ))}
            {isLoading && (
              <li className="flex flex-row-reverse">
                <div className="rounded-xl p-4 flex">
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="p-4 fixed w-full bottom-0 bg-background">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center"
          >
            <Input
              className="flex-1 min-h-[40px]"
              placeholder="Type your question here..."
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button 
              className="ml-2" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </section>
      </section>
    </main>
  );
}

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer" className="text-blue-500 underline cursor-pointer">
      {props.children}
    </a>
  );
}