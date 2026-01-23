# SÍNTESIS DE LITERATURA: Evidencia para Sistema de Priorización BAAR

**Fecha de compilación:** 2026-01-23
**Propósito:** Fundamentar pesos y criterios del sistema de scoring para indicación oportuna de BAAR

---

## 1. DIAGNÓSTICOS QUE PRECEDEN TBP (CIE-10 con OR)

### Estudio de Tailandia (Chongsuvivatwong et al., 2022)
**Fuente:** [Data Mining for ICD-10 Admission Diagnoses Preceding Tuberculosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC9027130/)

Análisis de registros hospitalarios 2015-2020, excluyendo pacientes con DM y VIH. Identificaron diagnósticos de ingreso 1-12 meses ANTES de diagnóstico de TB.

| Código CIE-10 | Diagnóstico | ROR (Odds Ratio Relativo) |
|---------------|-------------|---------------------------|
| **R04.2** | Hemoptisis | **34.69** |
| **J90** | Derrame pleural no especificado | Alto (significativo) |
| **J18.1** | Neumonía lobar no especificada | Significativo |
| **J18.9** | Neumonía no especificada | **3.10** |
| **J15.9** | Neumonía bacteriana no especificada | Significativo |
| J44.1 | EPOC con exacerbación aguda | En top 10 |
| E87.1 | Hiponatremia | Significativo (comorbilidad) |
| R50.9 | Fiebre no especificada | En top 10 |

**Hallazgo clave:** Los 5 diagnósticos más comunes que precedieron TB fueron relacionados con **infección respiratoria baja**. La TB frecuentemente se confunde con neumonía porque la presentación inicial es similar.

---

## 2. VENTANAS TEMPORALES Y OPORTUNIDADES PERDIDAS

### Estudio de California (Woodman et al., 2015)
**Fuente:** [Missed Opportunities to Diagnose Tuberculosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC4689274/)

Análisis de hospitalizaciones y visitas a urgencias en California 2005-2011.

| Ventana temporal | % con visita respiratoria previa | OR vs no-TB |
|------------------|----------------------------------|-------------|
| **5-15 días** | - | **5.85** |
| **5-30 días** | 15.9% | **4.86** |
| **5-90 días** | 25.7% | **3.83** |
| **5-365 días** | - | 2.79 |

**Interpretación para tu sistema:**
- La ventana de **30 días** captura la mayoría de oportunidades perdidas agudas
- La ventana de **90 días** es útil para patrones de recurrencia
- El OR más alto está en **5-15 días** (episodio agudo activo)

### Prevalencia de Oportunidades Perdidas
**Fuente:** [Population-based longitudinal study](https://pubmed.ncbi.nlm.nih.gov/33602715/)

- **77.2%** de pacientes con TB experimentaron al menos una oportunidad diagnóstica perdida
- Promedio de **3.89 visitas** representaron oportunidad perdida
- Duración media del retraso: **31.66 días**

---

## 3. TIEMPOS DE RETRASO DIAGNÓSTICO

### Revisión Sistemática Global
**Fuente:** [Systematic review of delay in diagnosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC2265684/)

| Tipo de retraso | Rango reportado (mediana) |
|-----------------|---------------------------|
| **Retraso total** | 25-185 días |
| **Retraso del paciente** | 4.9-162 días |
| **Retraso del sistema de salud** | 2-87 días |

**Meta ideal OMS:** No más de 2-3 semanas de retraso del paciente.
**Realidad:** Se excede por 10-15 días en promedio.

### Estudio Brasil
**Fuente:** [Time from symptom onset](https://pmc.ncbi.nlm.nih.gov/articles/PMC3697913/)

- Mediana síntomas → tratamiento: **11 semanas**
- Mediana síntomas → buscar atención: **8 semanas**
- Mediana entrada al sistema → diagnóstico: **2 semanas**
- **50% de pacientes** tenían tos < 2 semanas pero **80% ya eran bacilíferos**

**Implicación:** No esperar a tos de 2+ semanas para sospechar; el daño de transmisión ya ocurrió.

---

## 4. FACTORES DE RIESGO: DIABETES MELLITUS

### Meta-análisis Principal (Jeon & Murray, 2008)
**Fuente:** [Diabetes mellitus increases risk of active tuberculosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC2459204/)

- **13 estudios observacionales** (n = 1,786,212 participantes)
- 17,698 casos de TB

| Métrica | Valor |
|---------|-------|
| **Riesgo Relativo (RR)** | **3.11** (IC 95%: 2.27-4.26) |
| Rango de OR en caso-control | 1.16 - 7.83 |

**Conclusión:** DM se asocia con **~3 veces mayor riesgo** de TB activa.

### Efecto del Control Glucémico
**Fuente:** [Risk of TB by severity of DM](https://onlinelibrary.wiley.com/doi/10.1111/tmi.13133)

- DM **mal controlada** tiene mayor riesgo de TB que DM bien controlada
- Marcadores usados: glucosa plasmática, HbA1c, complicaciones, uso de insulina

### Meta-análisis Reciente con Randomización Mendeliana (2025)
**Fuente:** [Mendelian Randomization evidence](https://dmsjournal.biomedcentral.com/articles/10.1186/s13098-025-01615-w)

| Asociación | OR pooled | IC 95% | p-value |
|------------|-----------|--------|---------|
| DM2 → TB | **1.22** | 1.11-1.33 | <0.0001 |

**Nota:** Este OR es menor porque es causal (MR), no observacional.

---

## 5. FACTORES DE RIESGO: VIH

### Meta-análisis VIH y TB Multidrogorresistente
**Fuente:** [HIV and MDR-TB meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC7802168/)

| Asociación | OR pooled | IC 95% |
|------------|-----------|--------|
| VIH → MDR-TB | **1.42** | 1.17-1.71 |
| VIH → MDR-TB primaria | **2.72** | 2.03-3.66 |

### Incidencia de TB en VIH+ (África Subsahariana)
**Fuente:** [TB incidence in HIV-positive](https://pmc.ncbi.nlm.nih.gov/articles/PMC10507970/)

- Incidencia: **3.49 por 100 personas-año**
- Factor de riesgo más fuerte: Falta de terapia preventiva con isoniazida (AHR = 3.32)

---

## 6. CÓDIGOS CIE-10 PARA SÍNTOMAS CONSTITUCIONALES

### Síntomas Cardinales de TB y sus Códigos

| Síntoma | Código CIE-10 | Notas |
|---------|---------------|-------|
| **Tos** | R05 | Síntoma cardinal, subregistrado |
| **Hemoptisis** | R04.2 | **Señal de alarma**, OR = 34.69 |
| **Fiebre** | R50.9 | Constitucional |
| **Sudoración nocturna** | R61 | Constitucional, poco codificado |
| **Pérdida de peso** | R63.4 | Constitucional |
| **Disnea** | R06.02 | Avanzado |
| **Dolor torácico** | R07.9 | Inespecífico |

**Fuente:** [TB ICD-10 Codes Cheat Sheet - Tennessee](https://sntc.medicine.ufl.edu/Files/Resources/TB%20ICD-10%20Codes%20Cheat%20Sheet%20(TTBEP%2011-5-15).pdf)

---

## 7. DIAGNÓSTICOS "MÁSCARA" - Lista Consolidada

Basado en la literatura, estos son los diagnósticos que frecuentemente **enmascaran** TB no diagnosticada:

### Alta Prioridad (evidencia directa de preceder TB)
| Código | Diagnóstico | Justificación |
|--------|-------------|---------------|
| **J18.x** | Neumonía no especificada | ROR 3.10, muy común antes de TB |
| **J15.9** | Neumonía bacteriana | Significativo en estudio Tailandia |
| **J90** | Derrame pleural | Puede ser TB pleural no diagnosticada |
| **R04.2** | Hemoptisis | ROR 34.69, señal de alarma máxima |

### Media Prioridad (asociación clínica conocida)
| Código | Diagnóstico | Justificación |
|--------|-------------|---------------|
| J20.x | Bronquitis aguda | Máscara común, especialmente repetida |
| J44.x | EPOC | En top 10 de estudio Tailandia |
| J45.x | Asma | Diagnóstico diferencial común |
| J06.9 | IVRS no especificada | Alta frecuencia, baja especificidad |
| J40 | Bronquitis no especificada | Crónico puede enmascarar TB |

### Baja Prioridad (contexto específico)
| Código | Diagnóstico | Justificación |
|--------|-------------|---------------|
| J02.9 | Faringitis aguda | Solo relevante si recurrente |
| J03.9 | Amigdalitis aguda | Solo relevante si recurrente |

---

## 8. PROPUESTA DE PESOS BASADA EN EVIDENCIA

### Señales de Alarma (prioridad máxima)
| Señal | Peso sugerido | Evidencia |
|-------|---------------|-----------|
| Hemoptisis (R04.2) | **50 puntos** | ROR 34.69 |
| Derrame pleural (J90) | **50 puntos** | Significativo, puede ser TB pleural |

### Diagnósticos Respiratorios
| Diagnóstico | Peso sugerido | Evidencia |
|-------------|---------------|-----------|
| Neumonía (J18.x) | **25-30 puntos** | ROR 3.10, muy común antes de TB |
| Bronquitis aguda (J20) | **10-15 puntos** | Máscara frecuente |
| EPOC exacerbado (J44.1) | **15 puntos** | Top 10 estudio Tailandia |
| IVRS/Faringitis | **5 puntos** | Solo si recurrente |

### Síntomas Constitucionales
| Síntoma | Peso sugerido | Evidencia |
|---------|---------------|-----------|
| Pérdida de peso (R63.4) | **20 puntos** | Síntoma cardinal TB |
| Fiebre (R50.9) | **15 puntos** | Top 10 estudio Tailandia |
| Sudoración nocturna (R61) | **15 puntos** | Síntoma cardinal, poco codificado |

### Modificadores de Riesgo
| Factor | Peso sugerido | Evidencia |
|--------|---------------|-----------|
| VIH (B20-B24) | **40 puntos** | OR 1.42-2.72 para MDR-TB |
| DM2 (E11.x) | **15-20 puntos** | RR 3.11 para TB activa |
| DM mal controlada | **+10 puntos adicionales** | Mayor riesgo que DM controlada |
| Secuelas TB previas (B90) | **30 puntos** | Alto riesgo de reactivación |

### Temporalidad
| Patrón | Peso sugerido | Evidencia |
|--------|---------------|-----------|
| 2+ consultas respiratorias en 30 días | **20 puntos** | OR 4.86 (ventana 5-30d) |
| 3+ consultas respiratorias en 30 días | **30 puntos** | Patrón de episodio no resuelto |
| Churn diagnóstico (2+ dx diferentes) | **+10 puntos** | Señal de reencuadre |
| Neumonía recurrente (2+ en 12 meses) | **35 puntos** | Patrón de TB enmascarada |

---

## 9. VENTANAS TEMPORALES RECOMENDADAS

Basado en la evidencia:

| Ventana | Propósito | Justificación |
|---------|-----------|---------------|
| **21-30 días** | Episodio agudo activo | OR más alto (4.86-5.85) |
| **60-90 días** | Recurrencia intermedia | OR 3.83, captura 25.7% de casos |
| **12 meses** | Patrón anual | Neumonía recurrente |
| **24 meses** | Historia completa | Contexto de recurrencias |

---

## 10. FUENTES CITADAS

1. [Data Mining for ICD-10 Admission Diagnoses Preceding Tuberculosis - Thailand](https://pmc.ncbi.nlm.nih.gov/articles/PMC9027130/)
2. [Missed Opportunities to Diagnose TB - California](https://pmc.ncbi.nlm.nih.gov/articles/PMC4689274/)
3. [Incidence and risk factors of delayed diagnosis - Population study](https://pubmed.ncbi.nlm.nih.gov/33602715/)
4. [Missed opportunities for diagnosis - Systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8908873/)
5. [Systematic review of delay in diagnosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC2265684/)
6. [Duration and determinants of delayed TB diagnosis](https://pmc.ncbi.nlm.nih.gov/articles/PMC8459488/)
7. [DM increases risk of TB - Meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC2459204/)
8. [Risk of TB by DM severity - Systematic review](https://onlinelibrary.wiley.com/doi/10.1111/tmi.13133)
9. [DM and TB Mendelian Randomization](https://dmsjournal.biomedcentral.com/articles/10.1186/s13098-025-01615-w)
10. [HIV and MDR-TB meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC7802168/)
11. [TB incidence in HIV-positive - Sub-Saharan Africa](https://pmc.ncbi.nlm.nih.gov/articles/PMC10507970/)
12. [TB ICD-10 Codes Cheat Sheet - Tennessee](https://sntc.medicine.ufl.edu/Files/Resources/TB%20ICD-10%20Codes%20Cheat%20Sheet%20(TTBEP%2011-5-15).pdf)

---

## 11. PRÓXIMOS PASOS SUGERIDOS

1. **Validar con tus 194 casos:** Extraer OC34 y comparar si estos CIE-10 aparecen en tu población
2. **Ajustar pesos:** Los valores propuestos son iniciales; calibrar con datos locales
3. **Definir umbrales:** Según capacidad de laboratorio (1400 BAAR/año = ~27/semana)
4. **Implementar con GSD:** Una vez validados los criterios

---

*Documento generado para proyecto de Sistema de Priorización BAAR - UMF27*
