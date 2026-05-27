import Image, { type ImageProps } from "next/image";
import { shouldOptimizeImage } from "@/lib/remote-image";

type Props = ImageProps & {
  src: string;
};

/** `next/image` for local/Firebase URLs; native `<img>` for other remote admin URLs. */
export function RemoteImage({ src, alt, fill, className, sizes, priority, ...rest }: Props) {
  if (shouldOptimizeImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={priority}
        {...rest}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className={className}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      className={className}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      {...rest}
    />
  );
}
