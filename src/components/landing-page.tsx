"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  BarChart3,
  PlusCircle,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  MessageSquare,
  ListTodo,
  Kanban,
  FileSpreadsheet,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Kanban,
    title: "Kanban y lista",
    description: "Vista Kanban por estado y vista lista con toggle. Filtros por empresa, rol, estado, fechas, favoritas y etiquetas.",
  },
  {
    icon: PlusCircle,
    title: "Captura rápida",
    description: "Formulario minimalista (empresa, rol, link, fuente) para añadir una postulación en menos de un minuto.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Funnel por estado, tasa de respuesta, días a primera respuesta, postulaciones por mes y canales (LinkedIn, email, llamada).",
  },
  {
    icon: Users,
    title: "Contactos",
    description: "Por cada postulación: nombre, posición, canal (LinkedIn/email), link y notas. Todo en un solo lugar.",
  },
  {
    icon: MessageSquare,
    title: "Interacciones",
    description: "Registra cada interacción (LinkedIn, email, llamada) con fecha, si hubo respuesta y resultado.",
  },
  {
    icon: ListTodo,
    title: "Tareas y recordatorios",
    description: "Tareas con fecha límite (follow-up, email, llamada). Recordatorios configurables para postulaciones sin respuesta.",
  },
  {
    icon: FileSpreadsheet,
    title: "Importar / exportar",
    description: "Exporta a CSV o importa desde CSV. Exporta tu calendario ICS para Google Calendar o Apple Calendar.",
  },
  {
    icon: Shield,
    title: "Tus datos seguros",
    description: "Autenticación con email, Google o GitHub. Cada usuario ve solo sus postulaciones.",
  },
  {
    icon: Zap,
    title: "PWA y atajos",
    description: "Instálalo como app en el móvil. Atajos: Ctrl/Cmd+N → captura rápida, / → búsqueda global.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export function LandingPage() {
  return (
    <div className="landing-wrap flex flex-col w-full min-w-0 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-12 sm:py-20 md:py-28 lg:py-32 overflow-hidden landing-grid-bg min-w-0">
        <div className="absolute inset-0 landing-glow-orb pointer-events-none" aria-hidden />
        <motion.div
          className="absolute top-20 left-1/4 w-72 h-72 bg-[hsl(173,80%,40%)] rounded-full mix-blend-multiply dark:mix-blend-soft-light opacity-20 dark:opacity-25 blur-3xl pointer-events-none"
          aria-hidden
          animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-[hsl(160,84%,39%)] rounded-full mix-blend-multiply dark:mix-blend-soft-light opacity-15 dark:opacity-20 blur-3xl pointer-events-none"
          aria-hidden
          animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="relative max-w-4xl mx-auto text-center px-3 sm:px-6 space-y-5 sm:space-y-8 min-w-0"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div
            className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full landing-badge px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-medium tracking-wide uppercase max-w-full"
            variants={fadeUp}
          >
            <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="text-center">Seguimiento de búsqueda de empleo</span>
          </motion.div>
          <motion.h1
            className="text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-balance break-words px-1"
            variants={fadeUp}
          >
            Organiza tus postulaciones.
            <span className="block mt-1 sm:mt-2 landing-text-gradient break-words">Ninguna oportunidad se pierde.</span>
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-1"
            variants={fadeUp}
          >
            Kanban, contactos, interacciones, tareas y analytics en un solo lugar. Tema claro/oscuro, PWA instalable y sin complicaciones.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-stretch sm:items-center pt-2 px-1"
            variants={fadeUp}
          >
            <Button asChild size="lg" className="landing-cta w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold border-0 hover:opacity-95 min-w-0">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 min-w-0">
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-medium border-border/80 bg-background/80 dark:bg-card/50 dark:border-border backdrop-blur min-w-0">
              <Link href="/login" className="flex items-center justify-center min-w-0">Iniciar sesión</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Qué incluye cada postulación */}
      <motion.section
        className="relative py-12 sm:py-20 md:py-24 border-t border-border/50 min-w-0 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 min-w-0">
          <div className="flex items-start gap-2 sm:gap-3 mb-8 sm:mb-10 min-w-0">
            <div className="landing-accent-line h-8 sm:h-10 rounded-full shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-xl font-semibold text-muted-foreground uppercase tracking-wider">Detalle por postulación</h2>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mt-1 text-foreground break-words">
                Todo lo que necesitas por candidatura
              </p>
            </div>
          </div>
          <motion.ul
            className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 min-w-0"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-40px" }}
          >
            {[
              "Empresa, rol, link, fuente, estado, seniority, modalidad, salario esperado, stack, notas",
              "Checklist: portfolio, formulario externo, referral",
              "Timeline de actividades e historial de cambios",
              "Contactos (nombre, posición, LinkedIn/email, link)",
              "Interacciones (tipo, fecha, respuesta, resumen)",
              "Tareas con fecha límite y recordatorios",
              "Favorita, etiquetas, modo focus para concentrarte",
            ].map((item, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2 sm:gap-3 landing-card rounded-xl p-3 sm:p-4 transition-all duration-300 min-w-0"
                variants={fadeUp}
              >
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-[hsl(173,75%,60%)] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-base text-muted-foreground break-words min-w-0">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.section>

      {/* Features grid */}
      <motion.section
        className="relative py-12 sm:py-20 md:py-24 border-t border-border/50 min-w-0 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 min-w-0">
          <div className="flex items-start gap-2 sm:gap-3 mb-8 sm:mb-10 min-w-0">
            <div className="landing-accent-line h-8 sm:h-10 rounded-full shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-xl font-semibold text-muted-foreground uppercase tracking-wider">Funcionalidades</h2>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mt-1 text-foreground break-words">
                Diseñado para que tu búsqueda sea ordenada y efectiva
              </p>
            </div>
          </div>
          <motion.ul
            className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-40px" }}
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.li key={title} variants={fadeUp} className="min-w-0">
                <motion.div
                  className="h-full landing-card rounded-xl p-4 sm:p-6 transition-all duration-300 group min-w-0"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div className="rounded-lg landing-icon-wrap p-2 sm:p-2.5 shrink-0 group-hover:opacity-90 transition-opacity">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="font-semibold text-foreground mb-1 sm:mb-1.5 text-sm sm:text-base break-words">{title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground text-pretty leading-relaxed break-words">{description}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.section>

      {/* CTA final */}
      <motion.section
        className="relative py-12 sm:py-20 md:py-24 border-t border-border/50 min-w-0 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-2xl mx-auto px-3 sm:px-6 text-center space-y-4 sm:space-y-6 min-w-0">
          <motion.div
            className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl landing-badge"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Target className="h-6 w-6 sm:h-7 sm:w-7" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-words px-1">
            Empieza en menos de un minuto
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base px-1">
            Regístrate con tu email o con Google/GitHub. Sin tarjeta de crédito. Tus datos solo tuyos.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-1">
            <Button asChild size="lg" className="landing-cta h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold border-0 w-full sm:w-auto min-w-0">
              <Link href="/register" className="flex items-center justify-center min-w-0">Registrarse gratis</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
