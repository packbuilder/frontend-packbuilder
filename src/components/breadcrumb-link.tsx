import store from "@/store/store";
import { Link } from "@tanstack/react-router";


type BreadCrumbLinkProps = {
  link: string;
  text: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

export default function BreadCrumbLink({
  link,
  text,
  style,
  className,
  children,
}: BreadCrumbLinkProps) {
    const {addBreadCrumb} = store();

    return (
        <Link to={link} className={className} style={style} onClick={() => addBreadCrumb({link, text})}>
            {children}
        </Link>
    );
}