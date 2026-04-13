// "use client";

// import * as React from "react";
// import * as DialogPrimitive from "@radix-ui/react-dialog";
// import { X } from "lucide-react";

// import { cn } from "@/lib/utils";

// const Dialog = DialogPrimitive.Root;

// const DialogTrigger = DialogPrimitive.Trigger;

// const DialogPortal = DialogPrimitive.Portal;

// const DialogClose = DialogPrimitive.Close;

// const DialogOverlay = React.forwardRef<
//   React.ElementRef<typeof DialogPrimitive.Overlay>,
//   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
// >(({ className, ...props }, ref) => (
//   <DialogPrimitive.Overlay
//     ref={ref}
//     className={cn(
//       "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
//       className,
//     )}
//     {...props}
//   />
// ));
// DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// const DialogContent = React.forwardRef<
//   React.ElementRef<typeof DialogPrimitive.Content>,
//   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
// >(({ className, children, ...props }, ref) => {
//   const descriptionId = React.useId()
//   const titleId = React.useId()

//   return (
//     <DialogPortal>
//       <DialogOverlay />

//       <DialogPrimitive.Content
//         ref={ref}
//         {...props}
//         aria-describedby={props["aria-describedby"] ?? descriptionId} // ✅ safe fallback
//         aria-labelledby={props["aria-labelledby"] ?? titleId} // ✅ prevents title warning too
//         className={cn(
//           "fixed left-[50%] top-[50%] z-50 w-[95%] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 sm:rounded-lg",
//           className
//         )}
//       >
//         {/* ✅ Hidden fallback title */}
//         <span id={titleId} className="sr-only">
//           Dialog
//         </span>

//         {/* ✅ Hidden fallback description */}
//         <span id={descriptionId} className="sr-only">
//           Dialog content
//         </span>

//         {children}

//         <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
//           <X className="h-4 w-4" />
//           <span className="sr-only">Close</span>
//         </DialogPrimitive.Close>
//       </DialogPrimitive.Content>
//     </DialogPortal>
//   )
// })

// DialogContent.displayName = DialogPrimitive.Content.displayName

// const DialogHeader = ({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLDivElement>) => (
//   <div
//     className={cn(
//       "flex flex-col space-y-1.5 text-center sm:text-left",
//       className,
//     )}
//     {...props}
//   />
// );
// DialogHeader.displayName = "DialogHeader";

// const DialogFooter = ({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLDivElement>) => (
//   <div
//     className={cn(
//       "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
//       className,
//     )}
//     {...props}
//   />
// );
// DialogFooter.displayName = "DialogFooter";

// const DialogTitle = React.forwardRef<
//   React.ElementRef<typeof DialogPrimitive.Title>,
//   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
// >(({ className, ...props }, ref) => (
//   <DialogPrimitive.Title
//     ref={ref}
//     className={cn(
//       "text-lg font-semibold leading-none tracking-tight",
//       className,
//     )}
//     {...props}
//   />
// ));
// DialogTitle.displayName = DialogPrimitive.Title.displayName;

// const DialogDescription = React.forwardRef<
//   React.ElementRef<typeof DialogPrimitive.Description>,
//   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
// >(({ className, ...props }, ref) => (
//   <DialogPrimitive.Description
//     ref={ref}
//     className={cn("text-sm text-muted-foreground", className)}
//     {...props}
//   />
// ));
// DialogDescription.displayName = DialogPrimitive.Description.displayName;

// export {
//   Dialog,
//   DialogPortal,
//   DialogOverlay,
//   DialogClose,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogFooter,
//   DialogTitle,
//   DialogDescription,
// };

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const descriptionId = React.useId();
  const titleId = React.useId();

  return (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Content
        ref={ref}
        {...props}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[92%] sm:w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "max-h-[85vh] overflow-y-auto rounded-xl border bg-background",
          "p-5 sm:p-6 space-y-4 sm:space-y-5",
          "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          className,
        )}
      >
        {/* ✅ Proper accessibility (no warnings) */}
        <DialogTitle className="sr-only">Dialog</DialogTitle>
        <DialogDescription className="sr-only">
          Dialog content
        </DialogDescription>

        {children}

        {/* Close button */}
        <DialogPrimitive.Close className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-md p-1 opacity-70 hover:opacity-100 transition focus:outline-none focus:ring-2 focus:ring-ring">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-base sm:text-lg font-semibold leading-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
