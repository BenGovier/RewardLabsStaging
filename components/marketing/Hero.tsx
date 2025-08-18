import Image from "next/image"

interface HeroProps {
  title: string
  subtitle: string
  imageSrc?: string
  imageAlt?: string
}

export function Hero({ title, subtitle, imageSrc, imageAlt }: HeroProps) {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {imageSrc && (
            <div className="mb-8 flex justify-center">
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={imageAlt || "Hero illustration"}
                width={400}
                height={300}
                className="max-w-full h-auto"
              />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{title}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
