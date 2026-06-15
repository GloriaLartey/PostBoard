import { useNavigate } from "react-router-dom";

export default function Logo() {
    const navigate = useNavigate();
    return(
        <>
        <div onClick={() => navigate("/")} className="flex gap-1.5 items-center">
            <div className="p-2 bg-blue-600 text-xl text-white font-bold rounded-xl">PB</div>
            <div className="font-semibold text-xl">PostBoard</div>
        </div>
        </>
    );   
}