const renderValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) {
        return <span className="text-green-500">—</span>;
    }

    if (typeof value === 'boolean') {
        return <span className="text-green-800">{value ? 'Yes' : 'No'}</span>;
    }

    if (Array.isArray(value)) {
        return (
            <div className="space-y-2">
                {value.map((item, index) => (
                    <div key={`${key}-${index}`} className="pl-4 border-l border-green-200">
                        {renderValue(key, item)}
                    </div>
                ))}
            </div>
        );
    }

    if (typeof value === 'object') {
        return (
            <div className="grid grid-cols-1 gap-2">
                {Object.entries(value).map(([childKey, childValue]) => (
                    <div key={`${key}-${childKey}`} className="pl-4 border-l border-green-200">
                        <p className="text-xs uppercase text-green-500 mb-1">{childKey}</p>
                        {renderValue(childKey, childValue)}
                    </div>
                ))}
            </div>
        );
    }

    if (key === 'pdf_uri' || key === 'md_uri') {
        const bucket = import.meta.env.VITE_GOOGLE_CLOUD_BUCKET;
        const uri = `https://storage.googleapis.com/${bucket}/${value}`;
        return (
            <a
                href={uri}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-green-700 underline"
            >
                View document
            </a>
        );
    }

    return <span className="text-green-800">{value.toString()}</span>;
}

export { renderValue }