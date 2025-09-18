"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/toolbox/components/Container";
import { Button } from "@/components/toolbox/components/Button";
import { Plus, AlertCircle } from "lucide-react";

import { GlacierApiClient } from './api';
import { ApiKeyListItem, CreateApiKeyResponse } from './types';
import ApiKeysList from './ApiKeysList';
import CreateApiKeyModal from './CreateApiKeyModal';
import ApiKeyCreatedModal from './ApiKeyCreatedModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface TokenManagementProps {
  glacierJwt: string;
}

export default function TokenManagement({
  glacierJwt
}: TokenManagementProps) {
  // API client
  const apiClient = new GlacierApiClient(glacierJwt);

  // State
  const [apiKeys, setApiKeys] = useState<ApiKeyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxApiKeysAllowed, setMaxApiKeysAllowed] = useState(10);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKeyListItem | null>(null);
  const [deletingKeys, setDeletingKeys] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);


  // Load API keys
  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    // Clear other errors when refreshing since this is a user-initiated action
    setCreateError(null);
    setDeleteError(null);

    try {
      const response = await apiClient.listApiKeys();
      setApiKeys(response.keys);
      setMaxApiKeysAllowed(response.maxApiKeysAllowed);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  // Create API key
  const handleCreateApiKey = async (alias: string) => {
    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await apiClient.createApiKey({ alias });
      setCreatedKey(response);
      // Close create modal and show created key modal
      setShowCreateModal(false);
      // Refresh the list
      await fetchApiKeys();
    } catch (err) {
      console.error('Failed to create API key:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create API key';
      setCreateError(errorMessage);
      throw err; // Let the modal handle the error too
    } finally {
      setIsCreating(false);
    }
  };

  // Delete API key
  const handleDeleteApiKey = (keyId: string) => {
    const apiKey = apiKeys.find(k => k.keyId === keyId);
    if (apiKey) {
      setKeyToDelete(apiKey);
      setShowDeleteDialog(true);
      setDeleteError(null); // Clear any previous delete errors
    }
  };

  const confirmDeleteApiKey = async () => {
    if (!keyToDelete) return;

    setDeletingKeys(prev => new Set(prev).add(keyToDelete.keyId));
    setDeleteError(null);

    try {
      await apiClient.deleteApiKey(keyToDelete.keyId);
      // Refresh the list
      await fetchApiKeys();
      setShowDeleteDialog(false);
      setKeyToDelete(null);
    } catch (err) {
      console.error('Failed to delete API key:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete API key';
      setDeleteError(errorMessage);
    } finally {
      setDeletingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyToDelete.keyId);
        return newSet;
      });
    }
  };

  // Load API keys on mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const maxKeysReached = apiKeys.length >= maxApiKeysAllowed;

  return (
    <>
      {/* Create API Key Modal */}
      <CreateApiKeyModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError(null); // Clear create error when modal closes
        }}
        onSubmit={handleCreateApiKey}
        isCreating={isCreating}
        maxKeysReached={maxKeysReached}
      />

      {/* API Key Created Modal */}
      <ApiKeyCreatedModal
        isOpen={!!createdKey}
        onClose={() => setCreatedKey(null)}
        createdKey={createdKey}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        apiKey={keyToDelete}
        onConfirm={confirmDeleteApiKey}
        onCancel={() => {
          setShowDeleteDialog(false);
          setKeyToDelete(null);
          setDeleteError(null); // Clear delete error when dialog closes
        }}
        isDeleting={deletingKeys.has(keyToDelete?.keyId || '')}
      />

      <Container
        title="Glacier API Keys"
        description="Manage your API keys for accessing the Glacier API. Create, view, and revoke keys as needed for your applications."
      >
        {/* Header with Create Button */}
        <div className="mb-8 not-prose">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                Your API Keys
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage access tokens for the Glacier API
              </p>
            </div>
            <Button
              onClick={() => {
                setShowCreateModal(true);
                setCreateError(null); // Clear any previous create errors
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 !w-auto"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </div>

        {/* Create Error Display */}
        {createError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Failed to create API key</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{createError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delete Error Display */}
        {deleteError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Failed to delete API key</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{deleteError}</p>
              </div>
            </div>
          </div>
        )}

        {/* API Keys List */}
        <div className="not-prose">
          <ApiKeysList
            apiKeys={apiKeys}
            isLoading={isLoading}
            error={error}
            maxApiKeysAllowed={maxApiKeysAllowed}
            deletingKeys={deletingKeys}
            onRefresh={fetchApiKeys}
            onShowCreateForm={() => {
              setShowCreateModal(true);
              setCreateError(null); // Clear any previous create errors
            }}
            onDeleteKey={handleDeleteApiKey}
          />
        </div>
      </Container>
    </>
  );
}