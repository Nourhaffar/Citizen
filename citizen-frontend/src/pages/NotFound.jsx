import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-800">Page not found</h1>
      <p className="mt-4 text-lg text-gray-600">
        The route exists in the restored frontend, but this specific page does not.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Return home
      </Link>
    </div>
  );
};

export default NotFound;
