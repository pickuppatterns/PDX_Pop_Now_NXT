import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

export default async function ShopPage() {
  const payload = await getPayload({ config })

  const { docs: products } = await payload.find({
    collection: 'products',
    where: {
      status: { equals: 'active' },
    },
    sort: '-createdAt',
    depth: 1,
  })

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-medium mb-8">Shop</h1>

      {products.length === 0 ? (
        <p className="text-gray-500" data-testid="no-products">
          No products available yet.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="product-grid"
        >
          {products.map((product) => {
            const image =
              product.images?.[0]?.image && typeof product.images[0].image === 'object'
                ? product.images[0].image
                : null

            return (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                data-testid="product-card"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {image && typeof image === 'object' && 'url' in image ? (
                    <Image
                      src={image.url as string}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-medium text-sm">{product.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    ${((product.price ?? 0) / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
