"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const chatParent = useRef<HTMLUListElement>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [jobDescription, setJobDescription] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  });

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setJobDescription(e.target.value);
  };

  return (
    <main className="flex w-full min-h-screen bg-background">
      {/* Job Description Sidebar */}
      {/* <aside className="w-1/2 md:w-1/3 lg:w-1/4 p-4 border-r bg-muted/20 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Job Description</h2>
        <Textarea
          className="h-[calc(100vh-200px)] resize-none"
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={handleJobDescriptionChange}
        />
      </aside> */}

      {/* Chat Area */}
      <section className="flex flex-col w-full relative">
        <header className="p-4 border-b w-full">
          <h1 className="text-2xl font-bold">AI Codex Assistant</h1>
        </header>

        <section className="p-4 absolute w-full bottom-0">
          <form
            onSubmit={(event) => {
              handleSubmit(event, {
                experimental_attachments: files,
                body: {
                  jobDescription,
                },
              });

              setFiles(undefined);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="flex w-full items-center"
          >
            <Input
              className="flex-1 min-h-[40px]"
              placeholder="Type your question here..."
              type="text"
              value={input}
              onChange={handleInputChange}
            />
            {/* <input
              type="file"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
            /> */}
            <Button className="ml-2" type="submit">
              Submit
            </Button>
          </form>
        </section>

        <section className="flex-grow p-4 mb-[70px] ">
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
                    <div className="rounded-xl p-4 bg-background shadow-md flex w-3/4">
                      <div className="text-primary">
                        <span className="font-bold">Answer: </span>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{ a: LinkRenderer }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </li>
                )}
              </div>
            ))}
          </ul>
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
