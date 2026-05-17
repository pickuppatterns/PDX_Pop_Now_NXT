import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AddToCartButton from './AddToCartButton'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    where: {
      slug: { equals: slug },
      status: { equals: 'active' },
    },
    depth: 1,
    limit: 1,
  })

  if (!docs.length) notFound()

  const product = docs[0]

  const image =
    product.images?.[0]?.image && typeof product.images[0].image === 'object'
      ? product.images[0].image
      : null

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-gray-100 relative rounded-lg overflow-hidden">
          {image && typeof image === 'object' && 'url' in image ? (
            <Image src={image.url as string} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-medium mb-2">{product.name}</h1>
          <p className="text-2xl text-gray-700 mb-6">${((product.price ?? 0) / 100).toFixed(2)}</p>

          {product.inventory === 0 ? (
            <p className="text-red-500 text-sm mb-4">Out of stock</p>
          ) : (
            <p className="text-green-600 text-sm mb-4">{product.inventory} in stock</p>
          )}

          <AddToCartButton productId={String(product.id)} disabled={product.inventory === 0} />
        </div>
      </div>
    </main>
  )
}
