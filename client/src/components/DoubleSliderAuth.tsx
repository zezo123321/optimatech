
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    username: z.string().min(3, "Username must be at least 3 chars"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 chars"),
    accessCode: z.string().optional(),
});

function SocialIcons() {
    return (
        <div className="flex justify-center gap-4 my-4">
            {[FaGoogle, FaFacebookF, FaLinkedinIn].map((Icon, i) => (
                <button
                    key={i}
                    type="button"
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    <Icon size={16} />
                </button>
            ))}
        </div>
    );
}

export default function DoubleSliderAuth() {
    // Logic: isRightPanelActive = true means Overlay moved to Right.
    // Default (false): Overlay is on Left.
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const { user, isLoading, loginMutation, registerMutation } = useAuth();
    const { toast } = useToast();
    const [location, setLocation] = useLocation();

    // Check URL to set initial state
    useEffect(() => {
        if (location === "/auth/register") {
            setIsRightPanelActive(true);
        } else {
            setIsRightPanelActive(false);
        }
    }, [location]);

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === "student") setLocation("/dashboard");
            else if (["instructor", "ta"].includes(user.role))
                setLocation("/instructor-dashboard");
            else setLocation("/admin-dashboard");
        }
    }, [user, isLoading, setLocation]);

    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: "", password: "" },
    });

    const registerForm = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
            accessCode: "",
        },
    });

    const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
        loginMutation.mutate(data, {
            onError: (e) =>
                toast({
                    title: "Login Failed",
                    description: e.message,
                    variant: "destructive",
                }),
        });
    };

    const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
        registerMutation.mutate(data, {
            onError: (e) =>
                toast({
                    title: "Registration Failed",
                    description: e.message,
                    variant: "destructive",
                }),
        });
    };

    if (isLoading)
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <style>{`
        .container {
            background-color: #fff;
            border-radius: 30px; /* Modern rounded corners */
            box-shadow: 0 14px 28px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            width: 1000px; /* Fixed width for desktop */
            max-width: 100%;
            min-height: 600px;
        }

        /* --- Form Containers --- */
        .form-container {
            position: absolute;
            top: 0;
            height: 100%;
            transition: all 0.6s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 0 50px;
            text-align: center;
        }

        /* Sign In Container (Right Side Default) */
        .sign-in-container {
            left: 0;
            width: 50%;
            z-index: 2;
            opacity: 1;
            transform: translateX(100%); 
        }

        .sign-up-container {
            left: 0;
            width: 50%;
            z-index: 1;
            opacity: 0;
        }

        /* Active State (Right Panel Active) */
        .container.right-panel-active .sign-in-container {
            transform: translateX(100%);
            opacity: 0;
            z-index: 1;
        }
        
        .container.right-panel-active .sign-up-container {
            transform: translateX(0%);
            opacity: 1;
            z-index: 5;
            animation: show 0.6s;
        }

        @keyframes show {
            0%, 49.99% {
                opacity: 0;
                z-index: 1;
            }
            50%, 100% {
                opacity: 1;
                z-index: 5;
            }
        }

        /* Overlay Container */
        .overlay-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            overflow: hidden;
            transition: transform 0.6s ease-in-out;
            z-index: 100;
        }

        .container.right-panel-active .overlay-container {
            transform: translateX(100%);
        }

        .overlay {
            background: linear-gradient(to right, #0EA5E9, #2563EB); /* Optimatech Blue Gradient */
            background-repeat: no-repeat;
            background-size: cover;
            background-position: 0 0;
            color: #FFFFFF;
            position: relative;
            left: 0;
            height: 100%;
            width: 200%;
            transform: translateX(0);
            transition: transform 0.6s ease-in-out;
        }

        .container.right-panel-active .overlay {
            transform: translateX(-50%);
        }

        .overlay-panel {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 0 40px;
            text-align: center;
            top: 0;
            height: 100%;
            width: 50%;
            transform: translateX(0);
            transition: transform 0.6s ease-in-out, opacity 0.6s ease-in-out;
        }

        /* Left Panel (Visible Default) */
        .overlay-left {
            transform: translateX(0);
            opacity: 1;
        }
        
        .container.right-panel-active .overlay-left {
            transform: translateX(-20%);
            opacity: 0;
        }

        /* Right Panel (Hidden Default - on Right Half) */
        .overlay-right {
            right: 0;
            transform: translateX(20%);
            opacity: 0;
        }

        .container.right-panel-active .overlay-right {
           transform: translateX(0);
           opacity: 1;
        }
         /* Button Styles */
         .ghost {
             background-color: transparent;
             border: 2px solid #FFFFFF !important;
             border-radius: 999px;
             padding: 12px 45px;
             font-weight: 700;
             margin-top: 20px;
             cursor: pointer;
             letter-spacing: 1px;
             text-transform: uppercase;
             transition: transform 80ms ease-in, background-color 0.3s ease;
         }
         
         .ghost:active {
            transform: scale(0.95);
         }
         
         .ghost:hover {
            background-color: rgba(255, 255, 255, 0.2);
         }

         /* --- Mobile Responsive Styles --- */
         @media (max-width: 768px) {
             .container {
                 width: 100%;
                 min-height: 100vh;
                 border-radius: 0;
                 box-shadow: none;
             }
             
             .overlay-container {
                 display: none;
             }
             
             .form-container {
                 width: 100%;
                 padding: 0 30px;
                 position: absolute;
                 top: 50%;
                 transform: translateY(-50%);
                 transition: opacity 0.4s ease-in-out;
             }
             
             .sign-in-container {
                 left: 0;
                 z-index: 5;
                 opacity: 1;
                 transform: translateY(-50%) !important;
             }
             
             .sign-up-container {
                 left: 0;
                 z-index: 1;
                 opacity: 0;
                 pointer-events: none;
                 transform: translateY(-50%) !important;
             }
             
             /* Active State for Mobile */
             .container.right-panel-active .sign-in-container {
                 opacity: 0;
                 pointer-events: none;
                 transform: translateY(-50%) !important;
             }
             
             .container.right-panel-active .sign-up-container {
                 opacity: 1;
                 z-index: 5;
                 pointer-events: all;
                 transform: translateY(-50%) !important;
                 animation: none;
             }
         }
      `}</style>

            {/* Main Container toggles class */}
            <div className={`container ${isRightPanelActive ? "right-panel-active" : ""}`} id="container">

                {/* Sign Up Form Container (Left Side Layout) */}
                <div className="form-container sign-up-container">
                    <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="w-full space-y-3">
                            <h1 className="text-3xl font-bold mb-4 text-primary">Create Account</h1>
                            <SocialIcons />
                            <div className="text-sm text-gray-400 mb-4">or use your email for registration</div>
                            <FormField control={registerForm.control} name="name" render={({ field }) => (
                                <FormItem><FormControl><Input placeholder="Name" {...field} className="bg-gray-50 border border-gray-200 my-2 h-12" /></FormControl></FormItem>
                            )} />
                            <FormField control={registerForm.control} name="username" render={({ field }) => (
                                <FormItem><FormControl><Input placeholder="Username" {...field} className="bg-gray-50 border border-gray-200 my-2 h-12" /></FormControl></FormItem>
                            )} />
                            <FormField control={registerForm.control} name="email" render={({ field }) => (
                                <FormItem><FormControl><Input placeholder="Email" {...field} className="bg-gray-50 border border-gray-200 my-2 h-12" /></FormControl></FormItem>
                            )} />
                            <FormField control={registerForm.control} name="password" render={({ field }) => (
                                <FormItem><FormControl><Input type="password" placeholder="Password" {...field} className="bg-gray-50 border border-gray-200 my-2 h-12" /></FormControl></FormItem>
                            )} />
                            <FormField control={registerForm.control} name="accessCode" render={({ field }) => (
                                <FormItem><FormControl><Input placeholder="Org Code (Optional)" {...field} className="bg-gray-50 border border-gray-200 my-2 h-12" /></FormControl></FormItem>
                            )} />
                            <Button className="w-48 rounded-full h-12 bg-primary hover:bg-primary/90 mt-4 font-bold tracking-wide uppercase shadow-lg transition-transform hover:scale-105" type="submit" disabled={registerMutation.isPending}>
                                Sign Up
                            </Button>

                            {/* Mobile Toggle Link */}
                            <div className="md:hidden mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Already have an account?{" "}
                                    <span
                                        onClick={() => { setIsRightPanelActive(false); setLocation("/auth/login"); }}
                                        className="text-primary font-bold cursor-pointer hover:underline"
                                    >
                                        Sign In
                                    </span>
                                </p>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Sign In Form Container (Right Side Layout) */}
                <div className="form-container sign-in-container">
                    <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="w-full flex flex-col items-center space-y-4">
                            <h1 className="text-3xl font-bold mb-4 text-primary">Sign in</h1>
                            <SocialIcons />
                            <div className="text-sm text-gray-400 mb-4">or use your account</div>
                            <div className="w-full">
                                <FormField control={loginForm.control} name="username" render={({ field }) => (
                                    <FormItem><FormControl><Input placeholder="Username" {...field} className="bg-gray-50 border border-gray-200 my-2 h-12" /></FormControl></FormItem>
                                )} />
                                <FormField control={loginForm.control} name="password" render={({ field }) => (
                                    <FormItem><FormControl><Input type="password" placeholder="Password" {...field} className="bg-gray-50 border border-gray-200 my-2 h-12" /></FormControl></FormItem>
                                )} />
                            </div>

                            <Button className="w-48 rounded-full h-12 bg-primary hover:bg-primary/90 font-bold tracking-wide uppercase shadow-lg transition-transform hover:scale-105" type="submit" disabled={loginMutation.isPending}>
                                Sign In
                            </Button>
                            <a href="#" className="text-sm text-gray-500 hover:text-primary font-medium transition-colors">Forgot your password?</a>

                            {/* Mobile Toggle Link */}
                            <div className="md:hidden mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Don't have an account?{" "}
                                    <span
                                        onClick={() => { setIsRightPanelActive(true); setLocation("/auth/register"); }}
                                        className="text-primary font-bold cursor-pointer hover:underline"
                                    >
                                        Sign Up
                                    </span>
                                </p>
                            </div>
                        </form>
                    </Form>
                </div>

                {/* Overlay Container */}
                <div className="overlay-container">
                    <div className="overlay">

                        {/* Left Overlay Panel (Visible Default) */}
                        <div className="overlay-panel overlay-left w-[50%] absolute left-0 flex flex-col items-center justify-center text-white h-full px-12 text-center pointer-events-auto">
                            <h1 className="text-4xl font-bold mb-4">Hello, Friend!</h1>
                            <p className="mb-8 text-lg opacity-90">Enter your personal details and start your journey with us</p>
                            <button className="ghost hover:bg-white hover:text-primary transition-colors" onClick={() => { setIsRightPanelActive(true); setLocation("/auth/register"); }}>
                                Sign Up
                            </button>
                        </div>

                        {/* Right Overlay Panel (Visible Active) */}
                        <div className="overlay-panel overlay-right w-[50%] absolute right-0 flex flex-col items-center justify-center text-white h-full px-12 text-center pointer-events-auto">
                            <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
                            <p className="mb-8 text-lg opacity-90">To keep connected with us please login with your personal info</p>
                            <button className="ghost hover:bg-white hover:text-primary transition-colors" onClick={() => { setIsRightPanelActive(false); setLocation("/auth/login"); }}>
                                Sign In
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
