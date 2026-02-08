import type { Message } from "@/agent-schemas";

const MessagesContainer: React.FC<{ messages: Message[] }> = ({ messages }) => {
    // filter out system and tool messages
    messages = messages.filter(message => message.type === 'human' || message.type === 'ai');

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((message, idx) => (
                <div
                    key={idx}
                    className={`flex ${message.type === 'human' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'human'
                            ? 'bg-green-600 text-white rounded-br-none'
                            : 'bg-white text-green-800 rounded-bl-none border border-green-200'
                            }`}
                    >
                        <p className="text-sm">{message.content}</p>

                    </div>
                </div>
            ))}
        </div>
    )
}

export default MessagesContainer;