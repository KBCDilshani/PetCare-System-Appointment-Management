import { Link } from 'react-router-dom'
import { HeartIcon, HomeIcon, GiftIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Find Your Perfect Match',
    description: 'Browse through our available pets and find your ideal companion.',
    icon: HeartIcon,
    link: '/pets',
    buttonText: 'View Pets'
  },
  {
    name: 'Give a Forever Home',
    description: 'Start your journey to provide a loving home to a pet in need.',
    icon: HomeIcon,
    link: '/adopt',
    buttonText: 'Adopt Now'
  },
  {
    name: 'Support Our Mission',
    description: 'Help us care for more animals through your generous donations.',
    icon: GiftIcon,
    link: '/donate',
    buttonText: 'Donate'
  },
  {
    name: 'Pet Appointment Booking',
    description: 'Caring hands, happy paws schedule your pet’s visit with love and ease.',
    icon: HeartIcon,
    link: '/appointment',
    buttonText: 'Appointment'
  }
]

const stats = [
  { label: 'Pets Adopted', value: '500+' },
  { label: 'Happy Families', value: '450+' },
  { label: 'Years of Service', value: '10+' },
  { label: 'Success Rate', value: '95%' }
]

export default function Home() {
  return (
    <div className="-mt-8">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-600/30 to-primary-600/10" />
          <img
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80"
            alt="Hero background"
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Find Your Perfect Companion
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-100">
            Pets are more than just companions, they’re family. That’s why at our Pet Care Center, we treat them like one of our own with top-notch care and love.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/pets"
                className="rounded-xl bg-primary-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 hover:scale-105"
              >
                Find a Pet
              </Link>
              <Link
                to="/adopt"
                className="rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3 text-lg font-semibold text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                How to Adopt
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How You Can Help
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join us in our mission to provide loving homes for pets in need. Every action makes a difference.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-8 w-8 flex-none text-primary-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <Link
                        to={feature.link}
                        className="text-sm font-semibold leading-6 text-primary-600 hover:text-primary-500"
                      >
                        {feature.buttonText} <span aria-hidden="true">→</span>
                      </Link>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Trusted by Hundreds of Families
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                We've helped countless pets find their forever homes
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col bg-white/5 p-8">
                  <dt className="text-sm font-semibold leading-6 text-gray-300">{stat.label}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
          <div
            className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary-600 to-primary-400 opacity-30"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-primary-600 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Change a Life?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-100">
              Start your journey today and give a loving home to a pet in need.
              Every adoption makes a difference.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/pets"
                className="rounded-xl bg-white px-6 py-3 text-lg font-semibold text-primary-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 hover:scale-105"
              >
                Browse Available Pets
              </Link>
              <Link
                to="/donate"
                className="text-lg font-semibold leading-6 text-white hover:text-gray-100"
              >
                Support Our Mission <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div
              className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
              aria-hidden="true"
            >
              <div
                className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-primary-500 to-primary-400 opacity-25"
                style={{
                  clipPath:
                    'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}