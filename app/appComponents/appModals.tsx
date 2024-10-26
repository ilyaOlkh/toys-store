import CartModal from "../components/modals/cartModal";
import FavoriteModal from "../components/modals/favoritesModal";
import HeaderModal from "../components/modals/headerModal";

export default function AppModals() {
    return (
        <>
            <FavoriteModal />
            <CartModal />
            <HeaderModal />
        </>
    );
}
