function PageBackground({ children }) {
  return (
    <div className="min-h-screen relative p-4 bg-gradient-to-br from-black via-red-950/20 to-black">
      {/* Red Dot Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, red 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Red Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default PageBackground;