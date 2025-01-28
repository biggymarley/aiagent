import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LangChainAdapter } from 'ai';
import path from 'path';

export const dynamic = 'force-dynamic'

const loaderCSVspells = new CSVLoader(path.join(process.cwd(), 'public', 'codexData', 'spells.csv'));
const loaderCSVFeats = new CSVLoader(path.join(process.cwd(), 'public', 'codexData', 'feats.csv'));
const loaderCSVclasses = new CSVLoader(path.join(process.cwd(), 'public', 'codexData', 'class.csv'));




const TEMP = `Answer the user's questions based only on the following
            classes and spells. if any answer is not in the classes and spells and feats, 
            reply politely that you dont have the info.

            keep the answer in no more than 8 lines with all informations the user needs to know.

            if you used classes or spells or  feats, include its link using path column
            exemples of links:
            https://www.creedscodex.com/classdetails/class-path/
            https://www.creedscodex.com/spellsdetails/spell-path/
            https://www.creedscodex.com/featdetails/feat-path/


            ==================
            spells: {spells}
            ==================
            feats: {feats}
            ==================
            classes: {classes}
            ==================


            Current conversation:
            {chat_history}

            user: {question}
            assistant:`

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const message = messages.at(-1).content
        const classesDocs = await loaderCSVclasses.load()
        const spellsDocs = await loaderCSVspells.load()
        const featsDocs = await loaderCSVFeats.load()

        const prompt = PromptTemplate.fromTemplate(TEMP)
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-exp",
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            temperature: 0
        });
        const parser = new StringOutputParser();

        const chain = RunnableSequence.from([
            {
                chat_history: (input) => input.chat_history,
                question: (input) => input.question,
                classes: () => classesDocs,
                spells: () => spellsDocs,
                feats: () => featsDocs,
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

    } catch (error) {
        console.log("err", error);
    }

}