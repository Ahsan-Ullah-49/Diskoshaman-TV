import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="container interior">
      <h1>Page not found</h1>
      <p>The link may have changed.</p>
      <Link className="button button-primary" href="/">
        Back to home
      </Link>
    </div>
  );
}
