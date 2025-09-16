import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Car, Users, TrendingUp, ArrowRight, Zap, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-primary p-4 rounded-2xl shadow-[var(--shadow-primary)]">
                <Leaf className="h-12 w-12 text-primary-foreground" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold gradient-text">CarbonDrive</h1>
            </div>

            {/* Hero Text */}
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Drive Sustainable, <span className="gradient-text">Earn Rewards</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform your eco-responsible driving into $CDRIVE tokens. 
                The first platform that rewards drivers for reducing carbon emissions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="carbon" size="eco">
                <Link to="/register">
                  <Car className="h-5 w-5" />
                  Get Started Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">
                  I already have an account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">1,247</p>
                <p className="text-sm text-muted-foreground">Active Drivers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">2.4T</p>
                <p className="text-sm text-muted-foreground">CO₂ Avoided</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold gradient-text">R$ 15.2K</p>
                <p className="text-sm text-muted-foreground">Paid to Drivers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How CarbonDrive Works</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rewarding good driving, monetizing sustainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="carbon-card text-center">
              <CardHeader>
                <div className="bg-accent/10 p-3 rounded-full w-fit mx-auto mb-4">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Drive Eco</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Use our app during your trips to monitor your sustainable driving 
                  and earn $CDRIVE tokens automatically
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="carbon-card text-center">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Accumulate Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Every kilometer driven sustainably generates $CDRIVE tokens 
                  that can be exchanged for real money via PIX
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="carbon-card text-center">
              <CardHeader>
                <div className="bg-secondary/10 p-3 rounded-full w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>Receive Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  We transform the carbon you save into credits that are sold to companies, funding your rewards.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <Badge className="bg-accent/10 text-accent border-accent/20">
                Ready to get started?
              </Badge>
              <h3 className="text-3xl lg:text-4xl font-bold">
                Join the <span className="gradient-text">Sustainable Mobility</span> Revolution
              </h3>
              <p className="text-lg text-muted-foreground">
                Thousands of drivers are already earning money by driving consciously. 
                Be the next to be part of this change.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="carbon" size="eco">
                <Link to="/register">
                  <Users className="h-5 w-5" />
                  Create Free Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">
                  View Demo Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
