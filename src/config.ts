import type {
	EducationConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	OrganizationsConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Fox's Den",
	subtitle: "OvO",
	lang: "en",
	themeColor: {
		hue: 85,
		fixed: true,
	},
	banner: {
		enable: true,
		src: "/assets/images/banner.webp",
		position: "center",
		fullPage: true,
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
	// GitHub username for progress page
	githubUsername: "svecco",
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Archive,
		LinkPreset.Progress,
		LinkPreset.About,
		{
			name: "Apache",
			url: "https://apache.org/",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/assets/images/avatar.webp",
	name: "Svecco",
	bio: "Just an ordinary soul yearning to escape.",
	links: [
		{
			name: "Email",
			icon: "material-symbols:mail-rounded",
			url: "mailto:chenrui@sve.moe",
		},
		{
			name: "WhatsApp",
			icon: "fa6-brands:whatsapp",
			url: "chenrui@sve.moe",
		},
		{
			name: "Discord",
			icon: "fa6-brands:discord",
			url: "https://discordapp.com/users/svecco",
		},
		{
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/246563710",
		},
	],
};

export const organizationsConfig: OrganizationsConfig = {
	organizations: [
		{
			name: "THE ASF",
			url: "https://apache.org",
			logo: "/assets/images/apache.svg",
			description: "Rustacean, Contributor",
			admitted: true,
		},
		{
			name: "Google Dev Group",
			url: "https://gdg.community.dev",
			logo: "/assets/images/google_dev.svg",
			description: "GDG Hangzhou Member",
			admitted: true,
		},
	],
};

export const educationConfig: EducationConfig = {
	educationList: [
		{
			institution: "Zhejiang Lishui H.S.",
			url: "https://www.zj.gov.cn/",
			logo: "/assets/images/zlh.svg",
			duration: "2024-2027 Sci. Stream",
			admitted: true,
		},
		{
			institution: "Zhejiang University",
			url: "https://www.zju.edu.cn/",
			logo: "/assets/images/zju.svg",
			duration: "2027-2031 Stay Tuned",
			admitted: false,
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
