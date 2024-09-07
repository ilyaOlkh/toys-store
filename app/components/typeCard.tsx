import { types } from "@prisma/client";

export default function TypeCard({ typeObj }: { typeObj: types }) {
    return <div>
        <div>{typeObj.name}</div>
        {typeObj.image_blob ? <img src={typeObj.image_blob} alt="type img" /> : <></>}
    </div>
}