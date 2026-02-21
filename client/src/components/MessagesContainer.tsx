import type { Message } from "@/agent-schemas";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessagesContainerProps {
    messages: Message[];
    isGenerating: boolean;
    streamingUpdate?: string;
    ref: React.RefObject<HTMLDivElement | null>;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({ messages, isGenerating, streamingUpdate, ref }) => {
    // filter out system and tool messages
    messages = messages.filter(message => message.type === 'human' || message.type === 'ai');

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((message, idx) => (
                <div
                    key={idx}
                    className={`flex ${message.type === 'human' ? 'justify-end' : 'justify-center'}`}
                >
                    <div
                        className={`px-4 py-2 rounded-lg ${message.type === 'human'
                            ? 'max-x-xs lg:max-w-md bg-green-600 text-white rounded-br-none'
                            : 'max-w-xl lg:max-w-3xl bg-white text-green-800 rounded-bl-none border border-green-200'
                            }`}
                    >
                        <div className="text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {`${message.content}`}
                            </ReactMarkdown>

                        </div>

                    </div>
                </div>
            ))}
            {
                isGenerating && streamingUpdate && (
                    <div className='bg-white text-green-800 px-2 py-1'>{streamingUpdate}</div>
                )
            }
          <div className='py-2' ref={ref}></div>

        </div>
    )
}

export default MessagesContainer;