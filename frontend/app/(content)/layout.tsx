import { PreviewBanner } from "@cmsjs/components/shared/preview-banner";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PreviewBanner />
      {children}
    </>
  );
}
