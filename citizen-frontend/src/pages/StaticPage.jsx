const StaticPage = ({ title, description }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="rounded-3xl bg-white p-10 shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default StaticPage;
