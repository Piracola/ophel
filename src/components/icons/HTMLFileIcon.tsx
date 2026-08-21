import React from "react"

export const HTMLFileIcon = ({
  size = 16,
  className = "",
  ...props
}: {
  size?: number
  className?: string
} & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "block", width: size, height: size, verticalAlign: "middle" }}
      {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="m10 9-2 3 2 3" />
      <path d="m14 9 2 3-2 3" />
    </svg>
  )
}

export default HTMLFileIcon
