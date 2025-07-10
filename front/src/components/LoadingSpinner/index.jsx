// LoadingSpinner shows a spinning circle loader. You can set color and size.
const LoadingSpinner = ({ color = "#fff", size = 18 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
        >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((rotate, i) => (
                <circle
                    key={i}
                    cx="12"
                    cy="2"
                    r="0"
                    fill={color}
                    transform={`rotate(${rotate} 12 12)`}
                >
                    <animate
                        attributeName="r"
                        begin={`${i * 0.125}s`}
                        calcMode="spline"
                        dur="1s"
                        keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
                        repeatCount="indefinite"
                        values="0;2;0;0"
                    />
                </circle>
            ))}
        </svg>
    );
};

export default LoadingSpinner;
