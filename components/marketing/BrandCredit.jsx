export default function BrandCredit({store=false,preview=false,children}){
 if(preview)return <>{children}</>;
 return <a href={`https://mytiklink.com/made-with/${store?'stores':'landing-pages'}`} style={{color:'inherit',textDecoration:'none',font:'inherit',letterSpacing:'inherit',display:'inline',padding:0,margin:0,border:0,background:'none',boxShadow:'none'}}>{children}</a>;
}
