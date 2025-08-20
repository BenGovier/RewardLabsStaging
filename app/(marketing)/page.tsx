import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Star, Play } from "lucide-react"

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Turn website traffic into qualified leads
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Plug-and-play prize draws that capture emails, grow lists, and re-engage customers. Set up in minutes,
                see results in hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup/business"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium"
                >
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-md text-lg font-medium"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="flex items-center mr-6">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  No setup fees
                </div>
                <div className="flex items-center mr-6">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Cancel anytime
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/hero-devices-mockup.png"
                alt="Reward Labs platform mockup"
                width={500}
                height={400}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-600">Trusted by growing businesses worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center opacity-60">
            <Image
              src="/images/logo-financial-cloud.png"
              alt="Financial Cloud"
              width={120}
              height={40}
              className="mx-auto"
            />
            <Image src="/images/logo-carpbook-new.png" alt="Carpbook" width={120} height={40} className="mx-auto" />
            <Image src="/images/logo-wilson-house.png" alt="Wilson House" width={120} height={40} className="mx-auto" />
            <Image
              src="/images/logo-forever-thirsty.png"
              alt="Forever Thirsty"
              width={120}
              height={40}
              className="mx-auto"
            />
            <Image src="/images/logo-tandem.png" alt="Tandem" width={120} height={40} className="mx-auto" />
            <Image src="/images/logo-red-circle.png" alt="Red Circle" width={120} height={40} className="mx-auto" />
            <Image src="/images/logo-clear-water.png" alt="Clear Water" width={120} height={40} className="mx-auto" />
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why businesses choose Reward Labs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to create engaging prize campaigns that convert visitors into customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">85% Email Capture Rate</h3>
              <p className="text-gray-600">
                Our optimized forms and compelling prizes achieve industry-leading conversion rates.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup in Minutes</h3>
              <p className="text-gray-600">
                Launch your first campaign in under 10 minutes with our intuitive drag-and-drop builder.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3.2x Lead Growth</h3>
              <p className="text-gray-600">
                Businesses see an average 320% increase in qualified leads within the first month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600">Launch your first campaign in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Prize</h3>
              <p className="text-gray-600">
                Select from our prize catalog or add your own. Popular choices include gift cards, products, and
                experiences.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customize & Brand</h3>
              <p className="text-gray-600">
                Use our drag-and-drop builder to match your brand. Add your logo, colors, and custom questions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Launch & Collect</h3>
              <p className="text-gray-600">
                Share your campaign link or embed on your site. Watch qualified leads pour in automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What our customers say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Image
                  src="/images/testimonial-woman-1.png"
                  alt="Sarah Johnson"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-600">Marketing Director</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "We saw a 150% increase in email signups within the first week. The platform is incredibly easy to use."
              </p>
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Image
                  src="/images/testimonial-man-1.png"
                  alt="Mike Chen"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Mike Chen</div>
                  <div className="text-sm text-gray-600">E-commerce Owner</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The ROI has been incredible. We've generated over $50k in sales from leads captured through prize
                campaigns."
              </p>
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Image
                  src="/images/testimonial-man-2.png"
                  alt="David Rodriguez"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">David Rodriguez</div>
                  <div className="text-sm text-gray-600">Agency Founder</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Our clients love the results. We've made Reward Labs a core part of our lead generation strategy."
              </p>
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to turn your traffic into leads?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already growing with Reward Labs. Start your free trial today.
          </p>
          <Link
            href="/signup/business"
            className="inline-flex items-center bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-md text-lg font-medium"
          >
            Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="text-sm text-blue-100 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>
    </div>
  )
}
