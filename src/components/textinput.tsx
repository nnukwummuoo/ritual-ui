const TextInput = ({ label, name, type = "text", value, onChange, style }: { label: string, name: string, type?: string, value: string, onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, style?: React.CSSProperties }) => {
  return (
    <div className="">
      <label className="block text-sm font-medium " htmlFor={name}>
        {label}:
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          {...(onChange ? { value, onChange } : { defaultValue: value })}
          required
          className=""
          style={style}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          {...(onChange ? { value, onChange } : { defaultValue: value })}
          required
          className=""
          style={style}
        />
      )}
    </div>
  );
};

export default TextInput;
