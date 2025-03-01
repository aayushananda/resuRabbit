import Image from "next/image"

const navigation = [
  { name: 'Home', href: '#', current: false },
  { name: 'Find Jobs', href: '#', current: false },
  { name: 'Employees', href: '#', current: false },
  { name: 'Admin', href: '#', current: false },
  { name: 'About Us', href: '#', current: false }
]

export default function Navbar(){
    return(
        <div className="flex w-screen justify-evenly mt-4 items-center mb-4">
            <div className="flex gap-1 items-center">
                <Image 
                src="" 
                width={20} 
                height={20} 
                alt=""></Image>
                <h1 className="text-3xl text-[#6300B3] font-bold">ResuRabbit</h1>
            </div>
            <div>
                {navigation.map((item) => (
                    <a
                    key={item.name}
                    href={item.href}
                    className="m-4"
                    >{item.name}</a>
                ))}
            </div>
            <div className="flex gap-3">
                <button className="border-2 py-2 w-36 rounded-md border-[#6300B3] text-[#6300B3]">Contact Us</button>
                <button className="border-2 bg-[#6300B3] py-2 w-36 rounded-md border-[#6300B3] text-white">Login</button>
            </div>
        </div>
    )
}