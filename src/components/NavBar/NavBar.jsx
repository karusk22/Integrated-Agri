import "./NavBar.css";

function NavBar() {
    return (
        <>
            <div className="flex justify-between p-5">
                <h1 className="text-3xl text-green-800">Company Name</h1>
                <ul className="flex">
                    <li>
                        <a href="#">About Us</a>
                    </li>
                    <li>
                        <a href="#">Newstand</a>
                    </li>
                    <li>
                        <a href="#">Login / Signup</a>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default NavBar;