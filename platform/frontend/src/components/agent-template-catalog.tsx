"use client";

import React from "react";
import { AGENT_TEMPLATES, type AgentTemplate } from "@archestra/shared";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCreateProfile } from "@/lib/agent.query";

interface AgentTemplateCatalogProps {
  onCreated?: () => void;
}

export function AgentTemplateCatalog({ onCreated }: AgentTemplateCatalogProps) {
  const { mutateAsync: createProfile, isPending } = useCreateProfile();

  const handleInstall = async (template: AgentTemplate) => {
    try {
      await createProfile({
        name: template.name,
        description: template.description,
        icon: template.icon,
        systemPrompt: template.systemPrompt,
        agentType: "agent",
        scope: "personal",
        modelId: template.modelName,
        teams: [],
        knowledgeBaseIds: [],
        connectorIds: [],
      });

      toast.success(`${template.name} provisioned successfully!`);
      if (onCreated) {
        onCreated();
      }
    } catch (err: any) {
      toast.error(`Failed to install agent: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      {AGENT_TEMPLATES.map((tmpl) => (
        <Card key={tmpl.id} className="hover:border-primary/50 transition-all flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="text-3xl leading-none" role="img" aria-label={tmpl.name}>
                {tmpl.icon}
              </span>
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">{tmpl.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{tmpl.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-between items-center pt-0">
            <span className="text-[10px] text-muted-foreground">
              Requires: {tmpl.mcpServers.join(", ")}
            </span>
            <Button
              size="sm"
              onClick={() => handleInstall(tmpl)}
              disabled={isPending}
            >
              {isPending ? "Installing..." : "Install"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
