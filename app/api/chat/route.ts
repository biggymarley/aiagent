import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LangChainAdapter } from 'ai';
import path from 'path';

export const dynamic = 'force-dynamic'

// const loaderCSVspells = new CSVLoader("public/codexData/spells.csv");
// const loaderCSVFeats = new CSVLoader("public/codexData/feats.csv");
const csvPath = path.join(process.cwd(), 'public', 'codexData', 'class.csv');
const loaderCSVclasses = new CSVLoader(csvPath);



const TEMP = `Answer the user's questions based only on the following
            classes and spells. if any answer is not in the classes and spells , 
            reply politely that you dont have the info.

            Include references to which you used for each part of your answer.
            references should include exact data you based your answer from the document provided.
            references should be in anew line under each part of your answer.
            references should be wrapped between Backticks .
           
            classes: {classes}

            Current conversation:
            {chat_history}

            user: {question}
            assistant:`
export async function POST(req: Request) {
    try {
        const { messages, jobDescription } = await req.json();
        console.log(jobDescription)
        const message = messages.at(-1).content
        const classesDocs = await loaderCSVclasses.load()
        // const spellsDocs = await loaderCSVspells.load()
        // const featsDocs = await loaderCSVFeats.load()
        // const prompt = ChatPromptTemplate.fromTemplate(``);

        const prompt = PromptTemplate.fromTemplate(TEMP)
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-exp",
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            // maxOutputTokens: 2048,
            temperature: 0
        });
        const parser = new StringOutputParser();

        // const chain = prompt.pipe(model).pipe(parser);
        const chain = RunnableSequence.from([
            {
                chat_history: (input) => input.chat_history,
                question: (input) => input.question,
                classes: () => classesDocs,
                // spells: () => spellsDocs,
                // feats: () => featsDocs,
                // job_description: () => jobDescription
            },
            prompt,
            model,
            parser,
        ])

        const stream = await chain.stream({
            chat_history: messages.slice(0, -1),
            question: message,
        });

        return LangChainAdapter.toDataStreamResponse(stream);

        // const result = streamText({
        //     model: google('gemini-2.0-flash-exp'),
        //     system: 'You are a helpful assistant.',
        //     messages,
        // });
        // return result.toDataStreamResponse()
    } catch (error) {
        console.log("err", error);
    }

}