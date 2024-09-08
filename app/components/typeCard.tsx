import { types } from "@prisma/client";

export default function TypeCard({ typeObj }: { typeObj: types }) {
    return <div className="flex gap-2 flex-col max-w-48 w-full items-center text-center">
        {typeObj.image_blob ? <img src={typeObj.image_blob} alt="type img" /> : <></>}
        <div>{typeObj.name}</div>
    </div>
}