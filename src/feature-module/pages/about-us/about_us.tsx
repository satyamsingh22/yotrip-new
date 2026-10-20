
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ChooseUsSection from './choose_us_section';
import TeamSection from './teamSection';
import UserSection from './userSection';
import AboutSection from './aboutSection';
import { all_routes } from '../../router/all_routes';

const AboutUs = () => {

    const routes = all_routes;

    //Breadcrumb Data
    const breadcrumbs = [
        {
            label: 'About Us',
            link: routes.home1,
            active: false,
        },
        {
            label: 'Pages',
            active: true,
        },
        {
            label: 'About Us',
            active: true,
        },
    ];

    return (
        <div>
            <Breadcrumb
                title="About Us"
                breadcrumbs={breadcrumbs}
                backgroundClass="breadcrumb-bg-01"
            />
            <AboutSection/>
            <ChooseUsSection/>
            <TeamSection/>
            <UserSection/>

        </div>
    )
}

export default AboutUs
