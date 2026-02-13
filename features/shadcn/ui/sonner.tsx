"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "crt-toast group toast group-[.toaster]:bg-[hsl(200,30%,6%)] group-[.toaster]:text-white group-[.toaster]:border-2 group-[.toaster]:border-[hsl(174,100%,50%,0.4)] group-[.toaster]:rounded-sm group-[.toaster]:font-mono group-[.toaster]:pl-6",
          title: "group-[.toast]:text-white group-[.toast]:text-sm group-[.toast]:font-mono group-[.toast]:uppercase group-[.toast]:tracking-wide group-[.toast]:font-bold",
          description: "group-[.toast]:text-[hsl(174,100%,50%,0.8)] group-[.toast]:text-xs group-[.toast]:font-mono group-[.toast]:leading-relaxed",
          actionButton: "group-[.toast]:bg-[hsl(174,100%,50%)] group-[.toast]:text-[#0A0E1A] group-[.toast]:rounded-sm group-[.toast]:font-mono group-[.toast]:font-bold group-[.toast]:uppercase group-[.toast]:text-xs",
          cancelButton: "group-[.toast]:bg-[#1E293B] group-[.toast]:text-white group-[.toast]:rounded-sm group-[.toast]:font-mono group-[.toast]:uppercase group-[.toast]:text-xs",
          closeButton: "group-[.toast]:bg-[#1E293B] group-[.toast]:text-white group-[.toast]:border-[#1E293B] group-[.toast]:hover:bg-[#334155] group-[.toast]:rounded-sm",
          error: "group-[.toaster]:border-[hsl(0,100%,50%,0.5)] group-[.toaster]:bg-[hsl(0,30%,6%)]",
          success: "group-[.toaster]:border-[hsl(150,100%,45%,0.5)] group-[.toaster]:bg-[hsl(150,30%,6%)]",
          warning: "group-[.toaster]:border-[hsl(60,100%,50%,0.5)] group-[.toaster]:bg-[hsl(60,30%,6%)]",
          info: "group-[.toaster]:border-[hsl(174,100%,50%,0.5)] group-[.toaster]:bg-[hsl(174,30%,6%)]",
        },
      }}
      style={
        {
          "--normal-bg": "hsl(200, 30%, 6%)",
          "--normal-text": "white",
          "--normal-border": "hsl(174, 100%, 50%, 0.4)",
          "--border-radius": "0.125rem",
          "--toast-box-shadow": "0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.15)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
