// Service cards contain a separate details link and booking button, never nested links/buttons.
export default function ServiceCardLink({service,href,children,onClick,linkComponent:Link="a",...props}){
 return service?<div {...props}>{children}</div>:<Link href={href} onClick={onClick} {...props}>{children}</Link>;
}
