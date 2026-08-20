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
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={{ display: "block", width: size, height: size }}
      {...props}>
      <path
        fillRule="evenodd"
        d="M899.072 403.968h-14.336V275.456c0-8.192-3.072-16.384-9.216-22.016L624.128 11.776c-6.144-5.632-13.312-8.704-21.504-8.704h-465.92C89.088 3.072 50.688 41.472 50.688 89.088v845.824c0 47.616 38.4 86.016 86.016 86.016h662.528c22.528 0 45.056-9.216 60.928-25.6 16.384-16.384 25.088-37.888 24.576-60.416v-60.416h14.848c22.528 0 43.52-8.704 59.392-25.088 15.872-15.872 24.576-36.864 24.064-58.88V487.936c0-46.08-37.888-83.968-83.968-83.968zM400 590L520 530 520 570Z M400 590L520 610 520 650Z M545 500L557 500 597 680 585 680Z M640 590L560 530 560 570Z M640 590L560 610 560 650Z"
      />
      <path d="M899.072 403.968l-292.864-324.096 185.856 178.176-185.856-4.608V79.872z" />
    </svg>
  )
}

export default HTMLFileIcon
